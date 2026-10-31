# Refatoração: check-ins no servidor, limpeza e segurança — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acabar com a perda de check-ins entre aparelhos movendo o histórico das metas do blob para uma tabela do servidor (marcar + colher num único pedido), tirar baús/cartas/jornada e o módulo `Habit` do front e do back, e aplicar a varredura de segurança do backend.

**Architecture:** As definições das metas continuam no blob `farminghabit.goals.v1` (sincronizado por `cloudSync`), mas o histórico diário vai para `goal_checkins` (uma linha por jogador × meta × dia). Um novo módulo Nest `goals` grava o check-in e, na mesma transação, paga colheita e bônus da semana pelo livro-caixa `reward_claims` (função `payOnce` extraída para `progress/ledger.ts`). O front mantém o formato `GoalLog` na memória, alimentado por um cache local + fila offline em `lib/checkins.ts`, então `lib/goalLogic.ts` e as telas que só leem não mudam.

**Tech Stack:** NestJS 11, Prisma 6, Postgres (Supabase), Jest; React 19 + Vite + TypeScript (front sem testes: verificação por `npm run typecheck` e roteiro manual).

**Spec:** `docs/superpowers/specs/2026-10-31-farminghabit-mvp-foco-design.md` (Fase 0: check-ins; Fase 1: enxugar). Leia também `CLAUDE.md` da raiz.

## Global Constraints

- Textos de UI, comentários e mensagens de commit em **português do Brasil**; commits no estilo do repo (`refactor(escopo): ...`, `feat(...)`, `fix(...)`).
- Migrações são SQL escrito à mão em `backend/prisma/migrations/<timestamp>_<nome>/migration.sql`, aplicadas com `npm run db:deploy`. **Nunca** `migrate dev`.
- Toda tabela nova: `ENABLE ROW LEVEL SECURITY` + `REVOKE ALL ... FROM anon, authenticated`, sem políticas.
- **`npm run db:deploy` e `npm run test:shop:integration` atingem o banco real.** Só rodar com OK explícito da autora, depois de um backup (`pg_dump "$DIRECT_URL" > ~/farminghabit-backup-<data>.sql`).
- A economia é só do servidor: nenhum endpoint novo aceita moedas/XP do cliente. Valores: colheita `{ coins: 5, xp: 5 }`, bônus semanal `{ coins: 15, xp: 10 }` (já em `progress/economy.ts`).
- XP/nível: **não mexer** (decisão em aberto da autora).
- `ValidationPipe` global com `whitelist` + `forbidNonWhitelisted`: todo campo aceito (body e params) tem DTO com class-validator.
- Front: sem mudança visual fora da Task 5; regras de design do `CLAUDE.md` valem (pixel art, toasts, `GameDialog`).
- Verificação backend: `cd backend && npm test && npm run lint && npm run build`. Front: `cd frontend && npm run typecheck`.
- Entre a Task 4 (sai `POST /progress/harvest`) e a Task 9 (front usa a rota nova), a colheita fica quebrada no branch. **Não publicar nada no meio**; o deploy é do branch completo.
- As migrações das Tasks 2, 3 e 4 sobem juntas no `db:deploy` da Task 4 (a Task 7 tem o seu).

## Review Focus

1. **Dois aparelhos, metas diferentes, mesmo dia** → as duas marcações sobrevivem. Teste: Task 6 (`does not touch other goals`) + roteiro manual da Task 9.
2. **Celular offline marca uma meta** → fica na fila, sobe ao reconectar, não some e não paga duas vezes. Teste: roteiro manual da Task 9 (passo "offline").
3. **Desmarcar e marcar de novo no mesmo dia** → não paga a segunda vez. Teste: Task 6 (`does not pay again after unchecking and checking`).
4. **Meta recém-criada marcada antes de o blob subir** → o check-in é salvo; se o servidor ainda não conhece a meta, paga 0 sem erro. Teste: Task 6 (`saves the check-in of an unknown goal without paying`); front sobe o blob pendente antes (Task 8).
5. **Usuária antiga com semanas de histórico no blob** → o histórico aparece no calendário depois da atualização, e dias passados não pagam. Teste: Task 6 (`imports a log without paying`) + verificação SQL da Task 4.

---

### Task 1: Preservar o trabalho atual e abrir o branch

**Files:** nenhum arquivo de código.

- [ ] **Step 1: Guardar o trabalho não commitado (cartas, baús, CLAUDE.md, README, docker-compose) num branch de arquivo**

```bash
git switch -c backup/cartas-e-baus
git add -A
git commit -m "chore: arquivo do trabalho de cartas e baús antes da refatoração"
```
Expected: `git status` limpo. Conferir antes que nenhum `.env` entrou no commit (`git show --stat HEAD | grep -i "\.env$"` não imprime nada).

- [ ] **Step 2: Branch da refatoração a partir dele**

```bash
git switch -c refactor/fh-refatorado-v1
```

---

### Task 2: Backend — remover o módulo `Habit` e consultas pesadas

**Files:**
- Delete: `backend/src/habits/` (pasta inteira)
- Modify: `backend/src/app.module.ts` (tirar `HabitsModule`), `backend/src/main.ts` (tag `habits` do Swagger)
- Modify: `backend/src/users/services/users.service.ts` (`findOne` sem `include`; reset `goals` sem `habit.deleteMany`)
- Modify: `backend/src/users/controllers/users.controller.ts` (descrição do `PATCH`: só o nome)
- Modify: `backend/prisma/schema.prisma` (remover `model Habit` e `habits Habit[]`)
- Create: `backend/prisma/migrations/20261031120000_drop_habits/migration.sql`
- Create: `backend/src/users/services/users.service.spec.ts`

**Interfaces:**
- Produces: `UsersService.findOne(id: string): Promise<User>` passa a devolver só a linha de `users` (sem `habits`, `missions`, `rewards`).

- [ ] **Step 1: Teste que falha**

`users.service.spec.ts`, no estilo de `progress.spec.ts` (Prisma mockado):
```ts
it('loads the player without relations', async () => {
  await service.findOne('player');
  expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'player' } });
});
```
- [ ] **Step 2:** `cd backend && npx jest src/users/services/users.service.spec.ts` → FAIL (chamada traz `include`).
- [ ] **Step 3:** Tirar o `include` de `findOne`, apagar a pasta `habits`, o import em `app.module.ts`, a tag em `main.ts`, o `habit.deleteMany` do reset, o model no schema. Corrigir a descrição do `PATCH /users/me` para "Nome do jogador logado". Migração:
```sql
-- Hábitos antigos: substituídos pelas metas (definição no blob, histórico em goal_checkins)
DROP TABLE IF EXISTS "habits";
```
- [ ] **Step 4:** `npx prisma generate && npm test && npm run lint && npm run build` → tudo PASS; `grep -rn "habit" src --include=*.ts -i` só acha comentários sobre metas, se algum.
- [ ] **Step 5: Commit** — `refactor(backend): remove modulo Habit e consultas com relacoes no findOne`

---

### Task 3: Backend — remover baús e cartas

**Files:**
- Delete: `backend/src/progress/chest-rules.ts`, `backend/src/progress/card-rules.ts`
- Modify: `backend/src/progress/progress.service.ts` (remover `openChest`, `ChestResult`, imports de baú), `progress.controller.ts` (remover rota `chests/:chestId/open`), `dto/progress.dto.ts` (remover `OpenChestDto`), `progress.spec.ts` (remover `describe('chest rules')`, `describe('card rules')` e os dois testes de baú do `ProgressService`)
- Modify: `backend/src/users/dto/reset-user-data.dto.ts` (tirar `'treasure'` de `RESET_SCOPES`), `users.service.ts` (tirar `treasure` de `RESET_DATA_KEYS` e o bloco que estorna baús), `users.controller.ts` (texto do `DELETE /users/me/data`)
- Modify: `backend/prisma/schema.prisma` (comentários de `RewardClaim`: `kind` agora `harvest | week`; `chest` só em registros antigos)
- Create: `backend/prisma/migrations/20261031121000_drop_treasure_data/migration.sql`

**Interfaces:**
- Produces: `RESET_SCOPES = ['goals', 'diary', 'missions', 'shop', 'motivation', 'progress']`.

- [ ] **Step 1: Teste que falha** — em `users.service.spec.ts`:
```ts
it('rejects the removed treasure scope', () => {
  expect(RESET_SCOPES).not.toContain('treasure');
});
```
- [ ] **Step 2:** `npx jest src/users` → FAIL.
- [ ] **Step 3:** Remover o código listado. Claims `chest` já pagos **ficam** em `reward_claims` (sem estorno). Migração:
```sql
-- Baús e cartas saíram do jogo: apaga os dados que só eles usavam (o que já foi pago fica no livro-caixa)
DELETE FROM "user_data" WHERE "key" IN ('farminghabit.treasure.v1', 'farminghabit.cards.v1', 'farminghabit.harvest-rewards.v1');
```
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → PASS; `grep -rniE "chest|card|loot|booster" src` → nada além de comentários históricos em `schema`.
- [ ] **Step 5: Commit** — `refactor(backend): remove baus e cartas do servidor`

---

### Task 4: Backend — tabela `goal_checkins`, regras de meta e livro-caixa compartilhado

**Files:**
- Create: `backend/prisma/migrations/20261031130000_goal_checkins/migration.sql`
- Modify: `backend/prisma/schema.prisma` (model `GoalCheckin`, relação em `User`)
- Create: `backend/src/progress/ledger.ts` (extraído de `ProgressService.payOnce`)
- Modify: `backend/src/progress/goal-rules.ts` (sem `GoalBook`/`log`)
- Modify: `backend/src/progress/progress.service.ts` (fica só com `listClaims`; remove `harvest`), `progress.controller.ts` (remove `POST /progress/harvest`), `dto/progress.dto.ts` (remove `HarvestDto`)
- Modify: `backend/src/progress/economy.ts` (nova `isUpToPlayerToday`)
- Test: `backend/src/progress/progress.spec.ts`

**Interfaces:**
- Produces (schema):
  ```prisma
  model GoalCheckin {
    userId    String
    goalId    String
    day       String   /// AAAA-MM-DD, dia do jogador
    amount    Int
    updatedAt DateTime @updatedAt
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@id([userId, goalId, day])
    @@index([userId, day])
    @@map("goal_checkins")
  }
  ```
- Produces (`goal-rules.ts`): `GOALS_KEY`, `StoredGoal` (iguais), `parseGoals(value: string | null | undefined): StoredGoal[] | null`, `dailyTarget(goal: StoredGoal): number` (igual), `mondayOf(day: string): string` (igual), `weekDays(day: string): string[]` (7 dias, seg→dom), `weekChecks(goal: StoredGoal, amounts: Record<string, number>, day: string): number`, `isWeeklyGoalMet(goal: StoredGoal, amounts: Record<string, number>, day: string): boolean` — `amounts` é dia → quantidade **daquela meta**.
- Produces (`ledger.ts`): `interface Claim { key: string; kind: 'harvest' | 'week'; day: string; coins: number; xp: number }`, `payOnce(tx: Prisma.TransactionClient, userId: string, claims: Claim[]): Promise<{ paid: Claim[]; user: User }>` (mesmo corpo do `payOnce` atual, sem `detail`, **sem abrir transação própria**), `sumClaims(claims: Claim[], field: 'coins' | 'xp'): number`.
- Produces (`economy.ts`): `isUpToPlayerToday(day: string, now?: Date): boolean` — `DAY_PATTERN` válido e `day <=` o "hoje" mais adiantado (UTC+14).

- [ ] **Step 1: Testes que falham** — substituir os testes de `goal rules` em `progress.spec.ts`:
```ts
it('parses goal definitions and ignores the old log', () => {
  expect(parseGoals('{"goals":[{"id":"a"}],"log":{}}')).toEqual([{ id: 'a' }]);
  expect(parseGoals('nope')).toBeNull();
  expect(parseGoals('{"log":{}}')).toBeNull();
});
it('lists the seven days of the week from monday', () => {
  expect(weekDays('2026-10-29')).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
});
it('counts week checks from per-day amounts', () => {
  const goal = { id: 'g', frequency: { kind: 'weekly', timesPerWeek: 2 }, measure: { kind: 'check' } };
  const amounts = { '2026-10-26': 1, '2026-10-28': 1, '2026-10-19': 1 };
  expect(weekChecks(goal, amounts, '2026-10-29')).toBe(2);
  expect(isWeeklyGoalMet(goal, amounts, '2026-10-29')).toBe(true);
});
it('accepts past days and today, never the future', () => {
  const now = new Date('2026-10-31T12:00:00Z');
  expect(isUpToPlayerToday('2026-01-01', now)).toBe(true);
  expect(isUpToPlayerToday('2026-11-01', now)).toBe(true);  // já é dia 1 em UTC+14
  expect(isUpToPlayerToday('2026-11-02', now)).toBe(false);
});
```
Remover os testes `ProgressService` de colheita (a colheita vai para a Task 6).
- [ ] **Step 2:** `npx jest src/progress` → FAIL (funções não existem).
- [ ] **Step 3:** Implementar as interfaces acima; `ProgressService` passa a ter só `listClaims`. Migração (tabela + segurança + backfill do blob, um jogador com JSON inválido não derruba a migração):
```sql
CREATE TABLE "goal_checkins" (
  "userId" TEXT NOT NULL,
  "goalId" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "amount" INTEGER NOT NULL CHECK ("amount" > 0),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "goal_checkins_pkey" PRIMARY KEY ("userId", "goalId", "day"),
  CONSTRAINT "goal_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "goal_checkins_userId_day_idx" ON "goal_checkins"("userId", "day");
ALTER TABLE "goal_checkins" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "goal_checkins" FROM anon, authenticated;
```
Seguido de um bloco `DO $$ ... $$` que percorre `user_data` com `key = 'farminghabit.goals.v1'` e, para cada linha, dentro de `BEGIN ... EXCEPTION WHEN others THEN RAISE NOTICE ... END`, insere `jsonb_each(value::jsonb->'log')` × `jsonb_each_text(dia)` com `day ~ '^\d{4}-\d{2}-\d{2}$'`, `amount = round(valor::numeric)::int`, só `amount > 0`, `ON CONFLICT DO NOTHING`. Não apagar o `log` do blob aqui (o front para de ler; a Task 8 limpa).
- [ ] **Step 4:** `npx prisma generate && npm test && npm run lint && npm run build` → PASS.
- [ ] **Step 5 (só com OK da autora + backup):** `npm run db:deploy`; conferir:
```sql
SELECT count(*) FROM goal_checkins;  -- > 0 se havia histórico
SELECT count(*) FROM user_data WHERE key = 'farminghabit.goals.v1';
```
- [ ] **Step 6: Commit** — `feat(backend): tabela goal_checkins com historico migrado do blob`

---

### Task 5: Front — remover baús, cartas e jornada

**Files:**
- Delete: `frontend/src/components/missions/{BoosterOpening,CardAlbum,ChestOpening,TradingCard,TreasureIcons,WorldMap,Landmarks,MapAtmosphere}.tsx`, `components/missions/cardScenes.ts`, `lib/{cards,treasure,journey}.ts`, `styles/cards.css`
- Delete (código morto do antigo dashboard): `components/{HabitList,WellbeingCard,CharacterCard,Icon}.tsx`, `data/dashboard.ts`, `types/dashboard.ts`
- Modify: `pages/MissionsPage.tsx` (sem álbum, baús, `journeyState`; `.missions-side` some), `components/missions/MissionsHero.tsx`, `lib/guildGuide.ts` (sem escolhas `map`/`chests`), `pages/SettingsPage.tsx` (linha "Jornada das missões"), `components/settings/WipeDialog.tsx` (parte `treasure`), `services/api.ts` (`openTreasureChest`, `ChestResult`, import de `Loot`, `'treasure'` em `ResetScope`; `RewardClaim.kind` mantém `'chest'` porque há registros antigos), `lib/cloudSync.ts` e `lib/settings.ts` (tirar `treasure.v1`, `cards.v1`, `harvest-rewards.v1`), `main.tsx` (import de `cards.css`), `styles/missions.css` (seletores usados só pelos arquivos apagados)
- Delete também: `components/missions/pixelWorlds.ts` (a arte dos mundos só servia ao mapa e às cartas)
- Create: `components/missions/SailingShip.tsx` (cena nova do topo: navio velejando num mar com ondas)
- Keep: `components/missions/{GuideWarrior,GuideDialog,QuestScroll}` (o Capitão é usado por `MissionsPanel`).

- [ ] **Step 1: Proposta visual antes de aplicar (regra do CLAUDE.md para mudança estrutural)** — o topo das Missões deixa de ser o mapa da jornada. Decisão da autora: **um navio velejando num mar com ondas**. `MissionsHero` = céu + mar + navio (`SailingShip`) + a placa e o `CoinHud`; sem trilha, paradas, baús ou névoa. `SailingShip` é arte nova, desenhada à mão em SVG pixelado (`shape-rendering="crispEdges"`, cores dos tokens de `global.css`: casco `wood`/`brown`, velas `cream`/`paper`, mar em tons já usados na cena da Casa), no estilo das outras artes do repo.
  - **Vista de lado** (perfil do navio: proa, casco, mastro e velas), com detalhes de embarcação: tábuas do casco, amurada, cordas, bandeirinha.
  - **Impacto das ondas:** ondas em loop batendo no casco, com respingo pixelado na proa a cada batida; o navio **arfa para frente e para trás** (rotação de poucos graus em torno do centro do casco, com leve sobe-e-desce), sincronizado com as batidas. Animação com `steps()` para manter o ar de pixel art, sem deslocar a composição.
  - **Capitão (`GuideWarrior`) de pé no convés**, em tamanho proporcional ao navio (altura de uma pessoa atrás da amurada); escotilhas pequenas de latão no casco só como enfeite. (Revisão da autora: a escotilha grande com o Capitão ficou desproporcional.)
  - **Clicar no Capitão abre a conversa** (`GuideDialog`). O alvo é um `<button>` com `aria-label="Conversar com o Capitão"`, alcançável por Tab/Enter, com foco visível e cursor de clique; hover com contorno/brilho (sem texto de dica). O Capitão balança junto com o navio.
  - Com `prefers-reduced-motion`: ondas, respingo e arfagem parados; o clique continua funcionando. Altura do topo igual à atual em cada breakpoint (sem mudar o layout da página). Tirar print de antes e depois em 390px e 1280px e **parar até a autora aprovar** o desenho antes de seguir para o Step 2.
- [ ] **Step 2:** Apagar e ajustar os arquivos listados. Para o CSS: para cada classe em `missions.css`, `grep -rn "<classe>" src --include=*.tsx`; sem uso → remover a regra.
- [ ] **Step 3:** `cd frontend && npm run typecheck` → PASS; `grep -rniE "treasure|chest|journey|booster|cards\.v1" src --include=*.ts --include=*.tsx` → só `ChestPanel`/`chest-*` da Loja ("Minhas compras", não é baú) e `'chest'` em `RewardClaim`.
- [ ] **Step 4:** `npm run dev`, abrir Missões, Casa, Configurações e Loja em 390px e 1280px: sem erro no console, sem área vazia onde estava o álbum. Sem navegador disponível → registrar como não verificado.
- [ ] **Step 5: Commit** — `refactor(missao): remove baus, cartas e jornada do front`

---

### Task 6: Backend — módulo `goals`: check-in + colheita num único pedido

**Files:**
- Create: `backend/src/goals/goals.module.ts`, `controllers/goals.controller.ts`, `services/goals.service.ts`, `dto/checkin.dto.ts`, `services/goals.service.spec.ts`
- Modify: `backend/src/app.module.ts` (importar `GoalsModule`), `main.ts` (tag Swagger `goals`), `users/services/users.service.ts` (reset `goals` apaga `goalCheckin` do jogador)

**Interfaces:**
- Consumes: `parseGoals`, `dailyTarget`, `mondayOf`, `weekDays`, `isWeeklyGoalMet`, `GOALS_KEY` (Task 4); `payOnce`, `sumClaims`, `Claim` (Task 4); `isPlayerToday`, `isUpToPlayerToday`, `HARVEST_REWARD`, `WEEK_BONUS`, `DAY_PATTERN` (economy).
- Produces (HTTP, todas com o jogador do token):
  - `GET /goals/checkins` → `CheckinView[]` = `{ goalId: string; day: string; amount: number }[]`
  - `PUT /goals/:goalId/checkins/:day` body `{ amount: number }` → `CheckinResult` = `CheckinView & { coins: number; xp: number; weekBonus: boolean; user: User }`
  - `DELETE /goals/:goalId/checkins` → `{ goalId: string; removed: number }`
  - `POST /goals/checkins/import` body `{ log: Record<string, Record<string, number>> }` → `{ imported: number }`
- Produces (service): `list(userId)`, `setCheckin(userId, goalId, day, amount)`, `removeGoal(userId, goalId)`, `importLog(userId, log)` com os retornos acima.
- DTOs: `CheckinParamsDto { goalId: string (IsString, IsNotEmpty, MaxLength 100); day: string (Matches DAY_PATTERN) }`, `SetCheckinDto { amount: number (IsInt, Min 0, Max 10000) }`, `ImportCheckinsDto { log: object (IsObject) }` — o service valida cada entrada do `log` (dia `DAY_PATTERN` e `isUpToPlayerToday`, goalId ≤ 100, quantidade inteira 1..10000) e recusa com 400 acima de 20 000 entradas.

Regras de `setCheckin`, todas dentro de **uma** `prisma.$transaction`:
1. `day` fora de `isUpToPlayerToday` → 400.
2. `amount === 0` → `deleteMany` da linha; senão `upsert` pela chave `(userId, goalId, day)`.
3. Paga só se `isPlayerToday(day)`, a meta existe em `parseGoals(blob)` e `amount >= dailyTarget(goal)`: claim `harvest:<day>:<goalId>`; se `isWeeklyGoalMet` com as quantidades dos `weekDays(day)` lidas da tabela (já com a gravação nova), também `week:<mondayOf(day)>:<goalId>`. Chaves iguais às de hoje, para o livro-caixa antigo continuar valendo.
4. Meta desconhecida no blob → grava o check-in e devolve `coins: 0, xp: 0` (sem erro).

`importLog`: `createMany({ skipDuplicates: true })`; **nunca** paga.

- [ ] **Step 1: Testes que falham** (`goals.service.spec.ts`, Prisma e `tx` mockados como em `progress.spec.ts`):
```ts
it('saves the check-in and pays the harvest of today', ...)        // coins 5, xp 5; claim key `harvest:${TODAY}:leitura`
it('does not pay again after unchecking and checking', ...)         // createMany count 0 → coins 0, $queryRaw não chamado
it('pays the weekly bonus when the week target is met', ...)        // weekly timesPerWeek 1 → claims harvest + week, weekBonus true
it('stores past days without paying', ...)                          // day = ontem → upsert chamado, payOnce/createMany não
it('rejects future days', ...)                                      // '2999-01-01' → BadRequestException, $transaction não chamado
it('deletes the row when the amount is zero', ...)                  // amount 0 → deleteMany com { userId, goalId, day }
it('does not touch other goals', ...)                               // upsert where = { userId_goalId_day: { userId, goalId: 'leitura', day } }
it('saves the check-in of an unknown goal without paying', ...)     // blob sem a meta → upsert chamado, coins 0, sem exceção
it('imports a log without paying', ...)                             // createMany skipDuplicates, rewardClaim nunca chamado, imported = count
it('rejects malformed import entries', ...)                         // dia inválido, quantidade 0 ou 1.5 → BadRequestException
```
- [ ] **Step 2:** `npx jest src/goals` → FAIL.
- [ ] **Step 3:** Implementar módulo, controller (`@ApiTags('goals')`, `@ApiBearerAuth()`, `@CurrentUser()`), service e DTOs seguindo o padrão de `missions/`.
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → PASS. Com o backend rodando: o Swagger em `/api` mostra as 4 rotas de `goals` e nenhuma `progress/harvest` ou `chests`.
- [ ] **Step 5: Commit** — `feat(backend): check-in de meta e colheita num unico pedido`

---

### Task 7: Backend — varredura de segurança

**Files:**
- Modify: `backend/src/main.ts` (CORS e Swagger)
- Modify: `backend/src/users/services/users.service.ts` (`ensureUser`, lista fechada de chaves)
- Create: `backend/prisma/migrations/20261031140000_lock_direct_access/migration.sql`
- Modify: `backend/.env.example` (`CORS_ORIGIN`), `backend/README.md` (variável nova)
- Test: `backend/src/users/services/users.service.spec.ts`

**Interfaces:**
- Produces: `SYNC_DATA_KEYS` em `users.service.ts` = `['farminghabit.goals.v1', 'farminghabit.diary.v1', 'farminghabit.adventures.v1', 'farminghabit.missions.accepted.v1', 'farminghabit.profile.v1', 'farminghabit.wish.v1', 'farminghabit.perfect-day', 'farminghabit.settings.v1']` — **igual** ao `SYNC_KEYS` do front depois da Task 5.

Achados que esta task corrige:
1. `app.enableCors()` aceita qualquer origem → `enableCors({ origin: CORS_ORIGIN.split(',') })`, padrão `http://localhost:5173,http://localhost:8080`.
2. Swagger público em produção → só monta `/api` quando `NODE_ENV !== 'production'`.
3. `user_data` aceita qualquer chave `farminghabit.*` (até 900 KB cada, sem limite de chaves) → só `SYNC_DATA_KEYS`; outra chave → 400.
4. Políticas `*_own` para `authenticated` em `user_data` e `motivations` deixam a pessoa logada gravar direto pela API REST do Supabase, pulando as validações do backend → remover as políticas e revogar `authenticated`.
5. Corrida no primeiro acesso: pedidos paralelos de uma conta nova disparam `P2002` no `create` e o segundo recebe "e-mail já ligado a outro jogador" → em `P2002`, buscar de novo pelo `id` e devolver; só lançar `ConflictException` se o `id` não existir.

- [ ] **Step 1: Testes que falham** (`users.service.spec.ts`):
```ts
it('returns the player created by a concurrent request', ...)   // create rejeita P2002, findUnique 2ª vez devolve o user → resolve com ele
it('still rejects an email owned by another player', ...)       // P2002 e findUnique devolve null → ConflictException
it('accepts only the synced keys', ...)                         // saveData('player','farminghabit.cards.v1',...) → BadRequestException; goals.v1 → upsert chamado
```
- [ ] **Step 2:** `npx jest src/users` → FAIL.
- [ ] **Step 3:** Implementar 1–5. Antes da migração, confirmar que o front não usa `supabase.from(` (`grep -rn "supabase.from\|\.from('" frontend/src` → nada). Migração:
```sql
-- Só o backend acessa as tabelas: a sessão do site não grava direto pela API do Supabase
DROP POLICY IF EXISTS "user_data_select_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_insert_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_update_own" ON "user_data";
DROP POLICY IF EXISTS "user_data_delete_own" ON "user_data";
DROP POLICY IF EXISTS "motivations_select_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_insert_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_update_own" ON "motivations";
DROP POLICY IF EXISTS "motivations_delete_own" ON "motivations";
REVOKE ALL ON TABLE "users", "missions", "rewards", "purchases", "reward_overrides", "user_data", "motivations", "reward_claims", "goal_checkins", "_prisma_migrations" FROM authenticated;
```
(As políticas do bucket `motivation-photos` em `storage.objects` ficam; a foto está congelada.)
- [ ] **Step 4:** `npm test && npm run lint && npm run build` → PASS.
- [ ] **Step 5: Commit** — `fix(backend): cors restrito, swagger fora de producao e acesso direto bloqueado`

Fora desta task, registrado no fim do plano: limite de requisições (rate limit).

---

### Task 8: Front — check-ins pelo servidor, com cache e fila offline

**Files:**
- Create: `frontend/src/lib/checkins.ts`
- Modify: `frontend/src/services/api.ts`, `lib/cloudSync.ts`, `main.tsx`

**Interfaces:**
- Consumes: as rotas da Task 6.
- Produces (`api.ts`): `class NetworkError extends Error` (lançada por `request()` quando o `fetch` falha, com a mensagem atual); `interface Checkin { goalId: string; day: string; amount: number }`; `interface CheckinResult extends Checkin { coins: number; xp: number; weekBonus: boolean; user: Player }`; `listCheckins(): Promise<Checkin[]>`; `saveCheckin(goalId: string, day: string, amount: number): Promise<CheckinResult>`; `deleteGoalCheckins(goalId: string): Promise<{ goalId: string; removed: number }>`; `importCheckins(log: GoalLog): Promise<{ imported: number }>`. Remove `harvestGoal` e `HarvestResult`.
- Produces (`cloudSync.ts`): `flushIfPending(key: string): Promise<void>` — envia só se a chave tem timer ou está em `waiting`. `flushSync` sai (último uso era `harvestRewards`).
- Produces (`checkins.ts`):
  - `CHECKINS_EVENT = 'farminghabit:checkins'` (disparado em `window` sempre que o cache muda)
  - `readLog(): GoalLog` — do cache `farminghabit.checkins.cache.v1` (fora de `SYNC_KEYS`)
  - `setLocalAmount(goalId: string, day: string, amount: number): GoalLog` — grava no cache (0 apaga) e dispara o evento
  - `sendCheckin(goalId: string, day: string, amount: number): Promise<CheckinResult | null>` — chama `flushIfPending('farminghabit.goals.v1')` e `saveCheckin`; em `NetworkError` guarda em `farminghabit.checkins.pending.v1` (`{ "<goalId>|<day>": amount }`, a última vence) e devolve `null`; outros erros sobem; com `coins || xp` dispara `PLAYER_EVENT` com `result.user`
  - `removeGoalCheckins(goalId: string): Promise<void>` — tira do cache e da fila, chama `deleteGoalCheckins`
  - `syncCheckins(): Promise<void>` — (1) se o blob de metas ainda tem `log` não vazio, `importCheckins(log)` e regrava o blob só com `goals`; (2) reenvia a fila (`saveCheckin` um a um; sucesso tira da fila); (3) `listCheckins()` → cache; (4) dispara o evento. Também roda no evento `online` do `window`.
  - `clearCheckins(): void` — apaga cache e fila (usado pelo reset de metas e no `SIGNED_OUT`)

- [ ] **Step 1:** Implementar `api.ts` e `cloudSync.ts`.
- [ ] **Step 2:** Implementar `checkins.ts`.
- [ ] **Step 3:** `main.tsx`: depois que `startCloudSync()` resolve, `void syncCheckins()`; no primeiro acesso da conta (`firstOpen`), o `BootSplash` também espera `syncCheckins()`. No `SIGNED_OUT`, `clearCheckins()` antes do reload.
- [ ] **Step 4:** `npm run typecheck` → falha só nos usos de `harvestGoal`/`requestHarvest` (resolvidos na Task 9). Commit junto com a Task 9 se o typecheck não passar sozinho.

---

### Task 9: Front — telas usam o check-in unificado

**Files:**
- Modify: `frontend/src/hooks/useGoalTracker.ts`, `lib/harvestRewards.ts`, `pages/HomePage.tsx`, `pages/GoalsPage.tsx`, `lib/settings.ts`, `components/settings/WipeDialog.tsx`, `CLAUDE.md`

**Interfaces:**
- Consumes: `readLog`, `setLocalAmount`, `sendCheckin`, `removeGoalCheckins`, `clearCheckins`, `CHECKINS_EVENT` (Task 8).
- Produces (`useGoalTracker`): mesma forma de retorno, com `setAmount(goalId: string, day: string, amount: number): Promise<CheckinResult | null>`. O blob `farminghabit.goals.v1` passa a guardar `{ goals }` (`load()` continua aceitando o formato antigo). `seed()` cria só as metas de exemplo, **sem** histórico falso.
- Produces (`harvestRewards.ts`): ficam `HARVEST_REWARD`, `WEEK_BONUS`, `PLAYER_EVENT`, `rewardLabel(result: CheckinResult): string`; saem `reachesHarvest`, `requestHarvest`, `waitForSavedAmount`, `GOALS_KEY`.

- [ ] **Step 1:** `useGoalTracker`: `log` vem de `readLog()` e atualiza em `CHECKINS_EVENT`; `setAmount` chama `setLocalAmount` (tela responde na hora) e devolve `sendCheckin(...)`; `relapse` usa `setAmount(goalId, key, 0)` além de gravar `relapses`; `removeGoal` chama `removeGoalCheckins`.
- [ ] **Step 2:** `HomePage.harvest`/`payHarvest` e `GoalsPage.updateAmount`: trocar `reachesHarvest` + `requestHarvest` por `setAmount(...).then(result => ...)`. Com `result?.coins` → `flyCoins` + toast `rewardLabel`; `null` → toast "Sem conexão: a colheita sobe quando a internet voltar."; erro → toast com a mensagem.
- [ ] **Step 3:** Reset de metas (`WipeDialog`) chama `clearCheckins()`; backup (`lib/settings.ts`): `exportBackup` inclui `checkins: readLog()`; `importBackup` com `checkins` (ou `log` antigo dentro das metas) chama `importCheckins`.
- [ ] **Step 4:** Atualizar `CLAUDE.md`: seção "Two persistence models" (histórico em `goal_checkins`, definição no blob), rotas (`/goals`, sem `/habits`), economia (colheita = `PUT /goals/:goalId/checkins/:day`; baús removidos), `SYNC_KEYS` = lista do servidor.
- [ ] **Step 5:** `npm run typecheck` → PASS; `grep -rn "requestHarvest\|harvestGoal\|flushSync" src` → nada.
- [ ] **Step 6: Roteiro manual** (backend local + dois navegadores com a mesma conta, por exemplo Chrome e Chrome anônimo; sem navegador → registrar como não verificado):
  1. A marca "Ler", B marca "Treinar" sem recarregar → recarregar os dois: as duas metas marcadas; saldo +10.
  2. Desmarcar e marcar "Ler" em A → nenhuma moeda nova.
  3. **Offline:** DevTools de B → Offline, marcar "Alongar" (toast de sem conexão), voltar Online → em A, recarregar: "Alongar" marcada, pago uma vez.
  4. Criar meta nova em A e marcar na hora → colheita paga.
  5. Conta com histórico antigo (antes da Task 4) → calendário de Metas e Evolução mostram as semanas passadas; saldo não mudou.
- [ ] **Step 7: Commit** — `feat(metas): check-in direto no servidor, sem perda entre aparelhos`

---

### Task 10: Fechamento

- [ ] **Step 1:** `cd backend && npm test && npm run lint && npm run build`; `cd frontend && npm run typecheck && npm run build` → tudo PASS.
- [ ] **Step 2 (só com OK da autora):** `npm run test:shop:integration` → PASS (garante que a loja não quebrou com as migrações).
- [ ] **Step 3:** Revisão do branch inteiro; abrir PR de `refactor/checkins-e-limpeza` para `main` só se a autora pedir.

## Registrado para depois (fora deste plano)
- Rate limit (`@nestjs/throttler`) antes de abrir cadastro ao público.
- Meta de quantidade somada em dois aparelhos no mesmo dia guarda o último valor (limite aceito no spec).
- XP/nível: decisão da autora.
