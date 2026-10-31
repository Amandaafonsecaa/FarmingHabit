# FarmingHabit — MVP com foco (design)

Data: 2026-10-31 · Origem: brainstorm de produto (descoberta + decisões da autora)

## 1. Objetivo

Transformar o FarmingHabit, que hoje funciona mas não é usado (nem pela autora, porque precisa subir pelo terminal), em um app que a autora usa todo dia no celular para manter seus próprios hábitos. Publicar para o público vem depois, com o mesmo app.

Prioridade dos objetivos: **A** resolver o problema da autora → **B** portfólio → **C** produto público (grátis no lançamento; assinatura depois).

**Critério de sucesso do MVP:** a autora usa o app pelo celular por **21 dias seguidos** marcando as metas reais (ler, treinar, alongamento, escrever), sem abrir o terminal. Só depois disso o site é divulgado.

## 2. Proposta de valor

> Um tracker de hábitos aconchegante e sem poluição, onde moradores pixelados te acompanham e você troca constância por recompensas reais que você mesma escolheu.

Job to be done: *quando quero criar hábitos pequenos e já larguei apps frios ou entulhados, quero algo que me faça sentir acompanhada e merecedora, para continuar depois da segunda semana.*

**Loop real:** cumprir (meta ou missão) → ganhar moeda → resgatar recompensa real na loja. Os NPCs dão voz ao loop. A fazenda é tom e cenário, não mecânica.

## 3. Princípios

- **Menos é mais em conceitos, não só em pixels.** Uma moeda, um nível; nenhuma camada extra de recompensa.
- **Celular primeiro.** Toda mudança é validada em largura de celular (Android, Chrome) antes do notebook.
- **Uma persistência por feature.** Dado que o servidor precisa confiar (pagamento) nunca depende só do blob do localStorage. Não estender o modelo de blobs sincronizados nem o ledger além do que já existe.
- **Sem limite de metas, nunca** — foi o motivo nº 1 de a autora largar outros apps. A futura assinatura não    cobra por isso.

## 4. Decisões de escopo

| Item | Decisão | Motivo |
|---|---|---|
| Metas (recorrentes) | **Manter — núcleo** | |
| Missões (pontuais) | **Manter — núcleo** | Divisão clara meta = recorrente, missão = pontual |
| Moedas + loja de recompensas reais | **Manter — núcleo** | Diferencial real ("parecer que mereceu") |
| Evolução | **Manter — núcleo** | |
| NPCs (dúvidas, coach, gato da loja, fofoca) | **Manter — diferencial** | Personalidade é o que nenhum tracker tem |
| Diário | **Manter, atrelado à meta "escrever"** | Escrever é um hábito, não uma tela paralela |
| XP / nível | **Em aberto** — a autora decide depois (proposta: subir de nível libera fofoca/NPC novo) | Sem função, é um número duplicando as moedas |
| Baús, jornada, mapa com névoa | **Remover da UI** | Camada extra de recompensa; dreno de tempo |
| Cartas, boosters, álbum | **Remover da UI** (código guardado em branch) | Fonte única era o baú; terceira moeda; arte cara |
| Plantas | **Só cenário** | Sem lógica nova sobre elas |
| Foto de motivação | **Congelar** (fica como está, sem evoluir) | Custo baixo; manutenção e LGPD não justificam evoluir |
| Módulo `Habit` do backend (+ `HabitList`, `data/dashboard.ts` no front, se sem uso) | **Remover** | Código morto; metas vivem em `farminghabit.goals.v1` |
| Amigos / comparar níveis | **Fora do MVP** | Produto social é outro projeto |
| Periodização de treino | **Fora — app separado** | Navegação e calendário próprios; decisão da autora |
| Coach com IA, pet de tela, assinatura | **Fora do MVP** (seção 7) | Só depois de uso real |

## 5. Fases

### Fase 0 — No ar para uso próprio (pré-requisito de tudo)
- Deploy privado (frontend + backend + migrações) acessível por URL; cadastro aberto não é necessário divulgar.
- PWA instalável no Android: manifest, ícone, nome, cor de tema; abre em tela cheia pela tela inicial.
- Varredura de todas as telas em largura de celular (360–412px) com poucos e muitos itens; registrar o que estoura (cenas com `min-width` de 1000–1600px, navegação).
- **Check-ins numa tabela do servidor** (`goal_checkins`: uma linha por jogador, meta e dia, com a quantidade; RLS ligado, sem acesso para `anon`/`authenticated`). O histórico sai do blob `farminghabit.goals.v1`, que passa a guardar só a definição das metas. Marcar uma meta e receber a colheita viram **um único pedido** (`PUT /goals/:goalId/checkins/:day`), atômico no servidor. Histórico atual migrado do blob para a tabela, sem pagar dias passados.
- **Teste de sincronização em dois aparelhos**: marcar metas diferentes no celular e no notebook no mesmo dia e confirmar que nenhum check-in se perde, inclusive com um dos aparelhos offline.

### Fase 1 — Enxugar
- Tirar baús, jornada/mapa, cartas e boosters da página de Missões e de qualquer outro ponto de entrada (configurações de reset do tesouro, guia, textos de NPC que os citem). Código preservado em branch, não apagado do histórico.
- Backend: baús e cartas saem também do servidor (endpoint, regras de baú/cartas, parte "treasure" do reset). Claims de baú já pagos permanecem no ledger (sem estorno); os blobs de baú/cartas são apagados.
- Remover o módulo `Habit` (e a tabela `habits`) e os componentes mortos do front que só o atendiam.
- Varredura de segurança do backend aplicada: CORS restrito, Swagger fora de produção, chaves de `user_data` em lista fechada, políticas diretas de `authenticated` removidas, corrida no primeiro acesso corrigida.

### Fase 2 — Núcleo no celular
- **Check-in de 5 segundos:** no celular, a cena da home vira uma faixa baixa e o painel de Metas aparece sem rolagem. Mudança estrutural → antes/depois de uma tela aprovado pela autora antes de aplicar.
- **Rumo à recompensa:** na home, "faltam X 🪙 para [recompensa]", usando a lista de desejos (ou a recompensa mais barata ainda não alcançada).
- **Preço em esforço:** a loja já tem catálogo sugerido (`backend/src/rewards/catalog.ts`, ~30 🪙/dia). Mostrar ao lado do preço o equivalente em dias de metas ("≈ 2 dias"), inclusive ao criar recompensa própria.
- **Diário como meta:** existe uma meta "escrever" (oferecida no wizard). Salvar uma entrada no diário cumpre a meta do dia e paga como qualquer colheita. Sem essa meta, o item Diário some da navegação; entradas antigas continuam guardadas.

### Fase 3 — NPCs vivos sem IA
- Falas do coach geradas por **regras sobre dados reais** (métricas semanais já existentes: frequência por meta, sequência, meta esquecida), substituindo as falas mockadas fixas.
- Fofocas escritas à mão, **liberadas por nível**: cada nível novo libera uma fofoca (ou um NPC). Fofoca já lida não se repete enquanto houver inédita.

## 6. Fora do escopo deste spec
Lembrete por web push, coach com IA, assinatura, amigos/ranking, pet de tela, app de periodização, publicação/divulgação.

## 7. Direção registrada para depois (não implementar agora)
- **Coach com IA:** fatos calculados por regra → IA reescreve na voz do NPC em segundo plano (diário/semanal) → falas guardadas no banco → app lê do cache; sem cache, usa falas da Fase 3. A latência nunca fica no caminho de abrir o app. Fofoca continua escrita à mão.
- **Assinatura:** coach com IA + cosméticos (NPCs, cenários, pet). Nunca limite de metas.
- **Lembrete diário:** web push no Chrome Android, um por dia, configurável.

## 8. Riscos
- Perda de check-in entre aparelhos (blobs, última gravação vence) — resolvida pela tabela `goal_checkins` da Fase 0. Limite aceito: a mesma meta de quantidade somada em dois aparelhos no mesmo dia guarda o último valor enviado.
- Regra de colheita: com os check-ins no servidor, o back decide sozinho se o dia foi cumprido; o front repete só `dailyTarget` para desenhar a tela.
- Tentação de voltar a construir cenário: qualquer item fora da seção 4 vira proposta nova, não tarefa.
- Remoção dos baús esbarra em textos/NPCs e no reset das configurações; varrer referências.

## 9. Questões em aberto (resolver antes ou durante o plano)
1. Onde hospedar a Fase 0 (já existe `docker-compose.yml`; a escolha do provedor é da autora).
2. ~~Cartas/baús~~: decidido — saem do front e do back; o código fica preservado no branch `arquivo/cartas-e-baus`.
3. Nível: a autora quer conversar antes de decidir. Nada no plano de refatoração mexe em XP/nível.
4. Fofocas: quantas escrever para o lançamento (sugestão: uma por nível até o nível 10 + pool inicial).
