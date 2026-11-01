# Diário opcional e navegação no celular — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o Diário passa a existir só para quem quer escrever (ligado por uma pergunta no wizard e por um interruptor no Perfil), cumpre sozinho a meta `diario` ao salvar a página do dia, e a barra do celular muda conforme ele está ligado ou não.

**Architecture:** a ligação é uma meta comum no blob `farminghabit.goals.v1` com id fixo `diario`; desligar marca `paused: true` em vez de apagar. `useGoalTracker` continua sendo o único dono do blob: filtra as pausadas num ponto só, expõe `diaryOn`/`setDiaryEnabled` e sincroniza instâncias da mesma aba por um evento. A navegação lê só um booleano (`useDiaryEnabled`). Nada muda no backend: o check-in da meta `diario` usa o `PUT /goals/:goalId/checkins/:day` que já existe.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4 (CSS por página em `src/styles/`).

**Spec:** `docs/superpowers/specs/2026-10-31-diario-navegacao-niveis-design.md` — seções 1 (Diário opcional) e 2 (Navegação no celular). As seções 3 e 4 (níveis, guarda-roupa) têm planos próprios.

## Global Constraints

- Textos de interface, comentários e mensagens de commit em português do Brasil; commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Regras de design do `CLAUDE.md` valem em toda tarefa: paleta de `global.css`, bordas sólidas e cantos retos, sombras duras, `GameDialog` para modais, feedback de ação em toast, texto mínimo, `prefers-reduced-motion` respeitado.
- Alvos de toque de no mínimo 48px no celular (abaixo de 768px); linhas da gaveta da Mochila com 56px.
- Id fixo da meta: `diario`. Título padrão: `Escrever no diário`. Frequência diária, medida `check`, área `pessoal`, ícone `book`.
- A ligação é **sempre pelo id**, nunca pelo título (o título pode ser editado livremente).
- Desligar o Diário é **pausar**: nunca chamar `removeGoal`/`deleteGoalCheckins` para a meta `diario`.
- O front não tem testes nem linter: a verificação de cada tarefa é `npm run typecheck` (em `frontend/`) mais o roteiro manual descrito na própria tarefa, no navegador (DevTools, 390px e desktop). Não adicionar framework de testes.
- Executar num branch próprio criado a partir de `feat/responsividade` depois que as mudanças pendentes desse branch estiverem commitadas.

## Review Focus

1. **Duas instâncias de `useGoalTracker` na mesma aba** (wizard por cima da página, Configurações com a navegação) escrevendo o blob: não pode haver laço de eventos nem a meta `diario` sumir ou duplicar. → verificação na Task 1.
2. **Digitar na página de hoje** dispara exatamente **um** check-in da meta `diario` por dia, não um por tecla. → verificação na Task 2.
3. **Primeira abertura num navegador novo:** as páginas do diário chegam pelo pull do `cloudSync` depois do blob de metas; a meta `diario` precisa ser adotada uma vez só. → verificação na Task 1.
4. **"Arrancar" a meta `diario`** na tela de Metas pausa em vez de apagar, e religar devolve sequência e calendário. → verificação na Task 3.
5. **`#diario` com o Diário desligado** (link salvo, voltar do navegador) leva para a Casa; a Mochila acende na Loja quando o Diário está ligado. → verificação nas Tasks 2 e 5.

---

### Task 1: Meta `diario` e o estado do Diário

**Files:**
- Create: `frontend/src/lib/diaryGoal.ts`
- Create: `frontend/src/hooks/useDiaryEnabled.ts`
- Modify: `frontend/src/types/goals.ts` (campo `paused` em `TrackedGoal`)
- Modify: `frontend/src/hooks/useGoalTracker.ts`

**Interfaces:**
- Produces (`lib/diaryGoal.ts`):
  - `export const DIARY_GOAL_ID = 'diario'`
  - `export const GOALS_EVENT = 'farminghabit:goals'` — disparado sempre que o blob de metas muda nesta aba.
  - `export const isDiaryGoal = (goal: TrackedGoal) => boolean`
  - `export function createDiaryGoal(today: Date): TrackedGoal` — valores das Global Constraints, `createdOn = toKey(today)`.
  - `export function isDiaryOn(goals: TrackedGoal[]): boolean` — existe meta `diario` sem `paused`.
  - `export function withDiary(goals: TrackedGoal[], on: boolean, today: Date): TrackedGoal[]` — ligar: tira `paused` da existente ou acrescenta `createDiaryGoal(today)`; desligar: marca `paused: true` na existente; sem mudança devolve o mesmo array.
  - `export function adoptDiaryIfWritten(goals: TrackedGoal[], hasPages: boolean, today: Date): TrackedGoal[]` — sem nenhuma meta `diario` (nem pausada) e `hasPages` → acrescenta a meta ligada; caso contrário devolve o mesmo array.
- Produces (`types/goals.ts`): `TrackedGoal.paused?: boolean`.
- Produces (`useGoalTracker()`): continua devolvendo `goals` (agora **sem** as pausadas), `log`, `setAmount`, `addGoal`, `updateGoal`, `relapse`, `removeGoal`, e acrescenta `diaryOn: boolean` e `setDiaryEnabled(on: boolean): void`.
- Produces (`hooks/useDiaryEnabled.ts`): `export function useDiaryEnabled(): boolean` — só leitura do blob, para quem não precisa do tracker inteiro (navegação, `App`).

- [ ] **Step 1: Escrever `lib/diaryGoal.ts`** com as funções acima, todas puras (sem `localStorage`).

- [ ] **Step 2: Guardar todas as metas no estado e filtrar só na saída.** Em `useGoalTracker`, o estado interno passa a ser a lista completa (com pausadas); `goals` exposto = completa sem `paused`. `updateGoal` preserva `paused`. `load()` aplica `adoptDiaryIfWritten(lista, readDiary() tem alguma chave com hasContent, new Date())`.

- [ ] **Step 3: Sincronizar instâncias sem laço.**
  - O efeito que grava o blob **só grava e dispara `GOALS_EVENT` quando o JSON novo difere do que já está no `localStorage`**.
  - Cada instância ouve `GOALS_EVENT` e `useStorageChange` das chaves de metas **e** do diário (`DIARY_KEY`), recarrega com `load()` e só troca o estado quando a lista lida difere da atual (comparação por JSON).
  - `setDiaryEnabled(on)` = `setGoals(current => withDiary(current, on, new Date()))`.

- [ ] **Step 4: Escrever `useDiaryEnabled`**: lê o blob, devolve `isDiaryOn(goals)`, atualiza com `GOALS_EVENT` e `useStorageChange` da chave de metas.

- [ ] **Step 5: Verificar**
  - Run: `cd frontend && npm run typecheck` · Expected: sem erros.
  - Manual (Review Focus 1): com a Casa aberta, no console rodar `localStorage.getItem('farminghabit.goals.v1')` antes e depois de recarregar a página duas vezes: a meta `diario` aparece no máximo uma vez; a aba de Desempenho do DevTools não mostra eventos `farminghabit:goals` em sequência contínua.
  - Manual (Review Focus 3): numa janela anônima, entrar numa conta que já tem páginas no diário e nenhuma meta `diario`; depois do pull, o blob tem exatamente uma meta `diario` sem `paused`. Recarregar: continua uma só.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/diaryGoal.ts frontend/src/hooks/useDiaryEnabled.ts frontend/src/types/goals.ts frontend/src/hooks/useGoalTracker.ts
git commit -m "feat(diario): meta diario com pausa e sincronizacao entre instancias"
```

---

### Task 2: Escrever cumpre a meta; `#diario` desligado volta para a Casa

**Files:**
- Modify: `frontend/src/pages/DiaryPage.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `useGoalTracker().{ goals, log, setAmount, diaryOn }`, `DIARY_GOAL_ID`, `hasContent` (`lib/diary.ts`), `settleCheckin` (`lib/harvestRewards.ts`), `useDiaryEnabled()`.

- [ ] **Step 1: Check-in automático.** Em `DiaryPage`, quando `diaryOn`, a página de **hoje** (`todayKey`) tem conteúdo (`hasContent`) e `amountOn(meta diario, log, todayKey) === 0`, chamar `settleCheckin(meta.title, setAmount(DIARY_GOAL_ID, todayKey, 1))` **uma vez por dia**: um `useRef` guarda o último dia já enviado e o efeito depende só de `hasContent(entrada de hoje)`, `diaryOn` e `todayKey`. Páginas de outros dias nunca enviam. Apagar todo o texto de hoje não desfaz o check-in.

- [ ] **Step 2: Redirecionar.** Em `App`, com `useDiaryEnabled()` falso e `page === 'diary'`, trocar para `home` com `window.history.replaceState` (não empilha histórico).

- [ ] **Step 3: Verificar**
  - Run: `cd frontend && npm run typecheck` · Expected: sem erros.
  - Manual (Review Focus 2): Diário ligado, aba Rede do DevTools aberta; escolher o humor e digitar uma frase na página de hoje. Expected: **um** `PUT /goals/diario/checkins/<hoje>` e um toast de moedas; continuar digitando não gera outro pedido. Voltar para ontem e escrever: nenhum pedido.
  - Manual (Review Focus 5): Diário desligado, abrir `/#diario`. Expected: Casa, e o botão "voltar" do navegador não retorna ao Diário.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DiaryPage.tsx frontend/src/App.tsx
git commit -m "feat(diario): pagina do dia cumpre a meta e #diario desligado vai para a Casa"
```

---

### Task 3: A meta `diario` nas listas: "Escrever" e "Arrancar" que pausa

**Files:**
- Modify: `frontend/src/components/GoalsPanel.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`
- Modify: `frontend/src/components/goals/GoalCard.tsx`
- Modify: `frontend/src/pages/GoalsPage.tsx`

**Interfaces:**
- Consumes: `isDiaryGoal`, `useGoalTracker().setDiaryEnabled`.
- Produces: `GoalsPanel` ganha a prop `onWrite: () => void`; `GoalCard` ganha a prop opcional `onWrite?: () => void`.

- [ ] **Step 1: Casa.** Em `GoalsPanel`, para a meta `diario` o botão da linha diz **Escrever** (aria-label `Escrever no diário: <título>`) e chama `onWrite`; as outras metas não mudam. `HomePage` passa `onWrite={()=>onNavigate('diary')}`.

- [ ] **Step 2: Metas.** Em `GoalCard`, para a meta `diario`: sem colher hoje, o botão diz **Escrever** e chama `onWrite`; já cumprida hoje, o botão fica desabilitado com o texto **Escrito hoje** (não desfaz). `GoalsPage` passa `onWrite={()=>onNavigate('diary')}`.

- [ ] **Step 3: Banca.** Em `GoalsPage.harvestFromStand`, a meta `diario` vai para o Diário antes de qualquer outra regra.

- [ ] **Step 4: Arrancar pausa.** Em `GoalsPage.uproot`, para a meta `diario`: sem `window.confirm`, chamar `setDiaryEnabled(false)` e o toast `<título>: diário pausado. Religue em Configurações.`; nunca `removeGoal`.

- [ ] **Step 5: Verificar**
  - Run: `cd frontend && npm run typecheck` · Expected: sem erros.
  - Manual: na Casa e nas Metas a meta `diario` mostra "Escrever" e abre o Diário; o caixote dela na banca também abre o Diário.
  - Manual (Review Focus 4): com alguns dias escritos, "Arrancar" a meta nas Metas. Expected: toast de pausa, meta some das listas e o Diário some da navegação. Religar em Configurações → Perfil: a meta volta com o mesmo histórico no calendário e na sequência.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/GoalsPanel.tsx frontend/src/pages/HomePage.tsx frontend/src/components/goals/GoalCard.tsx frontend/src/pages/GoalsPage.tsx
git commit -m "feat(diario): botao Escrever nas listas e arrancar a meta pausa o diario"
```

---

### Task 4: Ligar e desligar — wizard e Configurações

**Files:**
- Modify: `frontend/src/components/profile/WelcomeWizard.tsx`
- Modify: `frontend/src/pages/SettingsPage.tsx`

**Interfaces:**
- Consumes: `useGoalTracker().{ diaryOn, setDiaryEnabled }`, `ChoiceCards` (`components/dialogs/GameDialog.tsx`), `PixelSwitch`, `SettingsGroup`/`SettingsRow`.

- [ ] **Step 1: Wizard.**
  - `STEPS` passa a `['Quem é você?', 'Seu personagem', 'Seu diário', 'Tudo pronto!']`.
  - O passo novo pergunta **"Quer escrever no diário todo dia?"** com `ChoiceCards`: `Sim` (dica `Ele aparece no menu e escrever conta como meta.`) e `Não` (dica `Dá para ligar depois nas Configurações.`). Começa em `Não`.
  - `finish()` chama `setDiaryEnabled(true)` quando a resposta for `Sim`.
  - "Pular" não liga o Diário.

- [ ] **Step 2: Configurações → Perfil.** Grupo `Diário`, entre a carta e o grupo `Conta`, com uma linha `Escrever no diário` e um `PixelSwitch` (`checked={diaryOn}`, `onChange={setDiaryEnabled}`). Sem descrição.

- [ ] **Step 3: Verificar**
  - Run: `cd frontend && npm run typecheck` · Expected: sem erros.
  - Manual: em Configurações → Sobre, "Rever boas-vindas"; responder `Sim` e entrar. Expected: Diário na navegação e meta "Escrever no diário" na Casa. Desligar no Perfil: somem os dois; ligar: voltam.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/profile/WelcomeWizard.tsx frontend/src/pages/SettingsPage.tsx
git commit -m "feat(diario): pergunta no wizard e interruptor no Perfil"
```

---

### Task 5: Barra do celular e Mochila

**Files:**
- Modify: `frontend/src/components/PixelIcon.tsx` (ícone `backpack`)
- Modify: `frontend/src/components/NavigationItem.tsx` (prop `className`)
- Modify: `frontend/src/components/GameNavigation.tsx`
- Modify: `frontend/src/components/MoreNavigationItem.tsx`
- Modify: `frontend/src/layouts/MainLayout.tsx`
- Modify: `frontend/src/styles/nav.css`

**Interfaces:**
- Consumes: `useDiaryEnabled()`.
- Produces: `GameNavigation` recebe `diaryEnabled: boolean`; `MoreNavigationItem` recebe `diaryEnabled: boolean`; `NavigationItem` aceita `className?: string`.

- [ ] **Step 1: Ícone.** `PixelIconName` ganha `'backpack'` com o path `'M5 1H11V3H13V5H14V15H2V5H3V3H5ZM6 2V3H10V2ZM4 7H12V8H4ZM6 10H10V12H6Z'` (o `PixelIcon` já usa `fillRule="evenodd"`, então alça, aba e bolso ficam vazados). Remover o ícone `more` se não sobrar uso.

- [ ] **Step 2: Itens da navegação.** Em `GameNavigation`, ordem no DOM (que é a ordem do desktop): Casa · Metas · Missões · Loja · Diário · Evolução · Mochila · Configurações.
  - **Casa e Metas:** classe `nav-lead`.
  - **Diário:** só renderiza com `diaryEnabled`, com classe `nav-diary`.
  - **Loja:** `desktopOnly` quando `diaryEnabled`.
  - **Evolução e Configurações:** continuam `desktopOnly`.
  - `MainLayout` passa `diaryEnabled={useDiaryEnabled()}`.

- [ ] **Step 3: Mochila.** `MoreNavigationItem` vira **Mochila** (rótulo, título da gaveta e ícone `backpack`). As páginas da gaveta são `[Loja, Evolução, Configurações]` com o Diário ligado e `[Evolução, Configurações]` com ele desligado; o Sair continua no fim. A aba acende quando a página atual está nessa lista.

- [ ] **Step 4: Ordem no celular.** Em `nav.css`, dentro do `@media (max-width: 767px)` da barra: `.game-nav-list > li { order: 2; }`, `.nav-lead { order: 0; }`, `.nav-diary { order: 1; }`. Resultado: `Casa · Metas · Diário · Missões · Mochila` (ligado) e `Casa · Metas · Missões · Loja · Mochila` (desligado).

- [ ] **Step 5: Verificar**
  - Run: `cd frontend && npm run typecheck && npm run build` · Expected: sem erros.
  - Manual a 390px, Diário ligado: barra `Casa · Metas · Diário · Missões · Mochila`; Mochila abre com Loja, Evolução, Configurações e Sair (linhas de 56px). Abrir a Loja pela Mochila: a Mochila fica acesa (Review Focus 5).
  - Manual a 390px, Diário desligado: barra `Casa · Metas · Missões · Loja · Mochila`; Mochila com Evolução, Configurações e Sair.
  - Manual a 320px: nenhum rótulo quebra para fora da aba; nenhuma rolagem horizontal.
  - Manual no desktop: gaveta lateral na ordem de antes, com o Diário só quando ligado.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/PixelIcon.tsx frontend/src/components/NavigationItem.tsx frontend/src/components/GameNavigation.tsx frontend/src/components/MoreNavigationItem.tsx frontend/src/layouts/MainLayout.tsx frontend/src/styles/nav.css
git commit -m "feat(nav): barra do celular conforme o diario e aba Mochila"
```

---

### Task 6: Documentar e conferir de ponta a ponta

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: `CLAUDE.md`.** Na seção "Two persistence models", depois do parágrafo "Goals are split", um parágrafo curto: o Diário é opcional e ligado pela meta de id fixo `diario` (nunca pelo título); desligar marca `paused: true` e `useGoalTracker` filtra as pausadas num ponto só; instâncias do tracker se sincronizam por `GOALS_EVENT` e só gravam quando o blob muda; a barra do celular depende de `useDiaryEnabled()`.

- [ ] **Step 2: Roteiro completo** (390px e desktop), com uma conta que já tem páginas escritas:
  - abrir o app: o Diário está ligado sem você fazer nada;
  - escrever hoje: um check-in, com moedas;
  - pausar pelo Perfil: Diário e meta somem, barra troca para a versão com Loja;
  - religar: tudo volta, com o histórico;
  - `#diario` com ele desligado: vai para a Casa.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: diario opcional e barra do celular no CLAUDE.md"
```
