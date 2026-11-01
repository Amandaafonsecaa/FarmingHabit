# Diário opcional, navegação no celular e níveis com guarda-roupa (design)

Data: 2026-10-31 · Origem: brainstorm com a autora (continuação do spec `2026-10-31-farminghabit-mvp-foco-design.md`)

Este documento registra três decisões ligadas entre si. Ele não substitui o spec do MVP: onde os dois divergem, vale este (o nível deixa de estar "em aberto"; o Diário passa a ser ligado por uma pergunta, não pelo nome da meta).

Implementação em **três etapas, nesta ordem**, cada uma com seu plano:

1. Diário opcional + navegação no celular (quase todo front).
2. Curva de níveis + moedas por nível (backend, pequena, com migração).
3. Guarda-roupa e pets (tabela nova, compra, arte nova).

---

## 1. Diário opcional

### Problema

Hoje o Diário aparece para todo mundo, sempre. Ele só faz sentido para quem quer o hábito de escrever, e ligar o Diário pelo **nome** de uma meta não funciona ("Escrever", "Journaling", "Desabafar"… nenhuma regra acerta os sinônimos).

### Decisões

- **Quem liga é uma pergunta, não o nome da meta.**
  - Wizard de boas-vindas, passo novo depois do nome e da personagem: **"Quer escrever no diário todo dia?"** · Sim / Não, com a nota "Dá para mudar depois nas Configurações".
  - Configurações → Perfil: interruptor **Diário**, que faz o mesmo a qualquer momento.
- **Ligado** cria a meta diária **"Escrever no diário"**:
  - id fixo `diario`, frequência diária, medida "marcar", área "pessoal", ícone livro;
  - o nome pode ser trocado na edição da meta (a ligação é pelo id, nunca pelo título).
- **Qualquer página salva no dia cumpre a meta** (inclusive só o humor). O Diário envia o check-in da meta `diario` para o dia de hoje pelo fluxo normal (`sendCheckin`), e o servidor paga como qualquer colheita. Páginas de dias passados não pagam (regra que o servidor já tem: só "hoje" paga).
- **Na lista de metas** (Casa, Metas e caixote da banca), a meta `diario` não tem "Colher": o botão é **"Escrever"** e abre o Diário.
- **Desligar é pausar**, não apagar:
  - a meta fica no blob `farminghabit.goals.v1` com `paused: true`;
  - `useGoalTracker` filtra as pausadas num ponto só, então nenhuma tela as vê (listas, estatísticas, coach, sequência);
  - o histórico em `goal_checkins` e as páginas do diário ficam intactos;
  - religar tira o `paused` e tudo volta como estava, com sequência e calendário.
- **Contas que já existem:** ao abrir o app, se não existe nenhuma meta `diario` (nem pausada) e o diário tem pelo menos uma página, a meta é criada **ligada**. A regra é idempotente: depois disso a meta existe, e desligar não a recria. Conta sem páginas e com o wizard já feito começa com o Diário desligado.
- **O Diário aparece na navegação só quando a meta `diario` existe e não está pausada.** Abrir `#diario` com ele desligado leva para a Casa.

### Fora do escopo

Lembrete para escrever; mínimo de caracteres; mais de uma meta ligada ao Diário.

---

## 2. Navegação no celular

Abaixo de 768px a navegação é a barra inferior fixa (já implementada nesta sessão). Ela passa a depender do Diário:

| Diário | Barra (5 abas) | Dentro da Mochila |
|---|---|---|
| Ligado | Casa · Metas · **Diário** · Missões · Mochila | Loja · Evolução · Configurações |
| Desligado | Casa · Metas · Missões · **Loja** · Mochila | Evolução · Configurações |

- A aba "Mais" vira **"Mochila"**, com ícone de mochila em pixel no lugar dos três pontinhos (que pareciam texto cortado).
- A Mochila acende quando a tela atual mora dentro dela.
- Alvos de toque de no mínimo 48px; a gaveta da Mochila mantém linhas de 56px.
- No desktop, a gaveta lateral mostra o item Diário só quando ele está ligado; o resto não muda.

---

## 3. Níveis

### Curva progressiva

Cada nível pede mais XP que o anterior: **para passar do nível _n_ para o _n_+1 são necessários `100 + 20·(n−1)` XP.**

| Do nível | Para o nível | XP necessário | XP total acumulado | ~Dias com 4 metas/dia (20 XP/dia) |
|---|---|---|---|---|
| 1 | 2 | 100 | 100 | 5 |
| 2 | 3 | 120 | 220 | 11 |
| 3 | 4 | 140 | 360 | 18 |
| 4 | 5 | 160 | 520 | 26 |
| 5 | 6 | 180 | 700 | 35 |
| 7 | 8 | 220 | 1.120 | 56 |
| 9 | 10 | 260 | 1.620 | 81 |
| 14 | 15 | 360 | 3.220 | 161 |

- XP total para **estar** no nível _L_: `T(L) = 10·L² + 70·L − 80` (T(1) = 0, T(2) = 100, T(3) = 220…).
- Nível a partir do XP total: `L = floor((−70 + √(4900 + 40·(xp + 80))) / 20)`, com uma correção inteira depois do cálculo (se `T(L+1) ≤ xp`, soma 1; se `T(L) > xp`, subtrai 1) para não depender de arredondamento de ponto flutuante.
- A fórmula mora no backend (`progress/economy.ts`, `levelFor`) e também no `UPDATE` atômico de `wallet.ts`, que recalcula o nível. As duas implementações precisam do mesmo teste de tabela.
- O XP por ação **não muda**: meta cumprida +5 XP, semana batida +10 XP, missões com o valor escolhido.
- Missões continuam acelerando bastante (uma "Conquista" dá até 120 XP), o que é bom: quem faz missões sobe mais rápido.

### Migração: ninguém desce de nível

A troca de curva recalcularia o nível de quem já joga (com a curva antiga, 100 XP fixos, o nível subia mais rápido). A migração SQL roda uma vez e **preserva o nível atual e a fração de progresso dentro dele**:

- nível atual _L_ = `floor(xp / 100) + 1` (curva antiga);
- progresso dentro do nível = `(xp mod 100) / 100`;
- XP novo = `T(L) + round(progresso × (100 + 20·(L−1)))`.

O histórico (`reward_claims`) não muda: ele registra moedas e XP pagos, não o nível.

### O front não sabe a curva

Hoje vários lugares assumem 100 XP por nível (`LevelCard`, carta colecionável, Evolução, "100 XP por nível" em Configurações → Sobre). O servidor passa a mandar, junto com o jogador, **`xpInLevel`** (XP já feito no nível atual) e **`xpForNext`** (XP necessário para o próximo). Barras, textos e a carta usam só esses dois números. O texto de Sobre vira "Cada nível pede um pouco mais de XP".

### Moedas crescem com o nível

Para os enfeites não roubarem moedas das recompensas reais, a meta diária paga mais conforme o nível:

**moedas por meta cumprida = `5 + min(5, floor(nível / 3))`**

| Nível | 1–2 | 3–5 | 6–8 | 9–11 | 12–14 | 15+ |
|---|---|---|---|---|---|---|
| Moedas por meta | 5 | 6 | 7 | 8 | 9 | 10 |

- Calculado no servidor no momento do pagamento, com o nível atual (`payOnce` recebe o valor já calculado).
- Só a meta diária muda. O bônus semanal continua +15 moedas, e as missões, o valor escolhido.
- **O XP nunca cresce com o nível.** Se crescesse, a subida viraria uma bola de neve e os desbloqueios acabariam cedo.
- O espelho `HARVEST_REWARD` do front deixa de ser fixo: os textos ("+5 moedas") usam o valor do nível do jogador.

---

## 4. Guarda-roupa e pets

### Ideia

O nível **destrava** itens; as moedas **compram**. Assim cada número tem um papel: moedas pagam recompensas da vida real e enfeites; o nível abre coisas novas.

### Catálogo

- Fixo no backend (`wardrobe/catalog.ts`), no mesmo molde do catálogo da Loja: `key`, `kind` (`pet` ou `outfit`), nome, preço, nível de desbloqueio.
- **Lançamento com 6 itens** (nomes, preços e níveis iniciais, ajustáveis):

| Item | Tipo | Nível | Preço | Chega em ~ |
|---|---|---|---|---|
| Gato | pet | 2 | 60 | 1 semana |
| Chapéu de aprendiz de bruxo | roupa | 3 | 90 | 2 semanas |
| Sapinho | pet | 5 | 120 | 4 semanas |
| Armadura do norte | roupa | 8 | 200 | 2 meses |
| Capa do inverno | roupa | 11 | 260 | 3–4 meses |
| Dragãozinho | pet | 15 | 400 | 5–6 meses |

- **Temas genéricos, sem marcas.** O item pode lembrar uma série (fantasia medieval, escola de magia, dragões), mas nunca usa nome, brasão, logo ou personagem reconhecível.
- Itens novos entram depois em níveis mais altos, sem mexer na curva.

### Compra e posse

- Tabela nova `owned_items` (`userId`, `itemKey`, `purchasedAt`), chave primária `(userId, itemKey)`.
- A migração da tabela **liga RLS e revoga `anon` e `authenticated`**, como todas as tabelas de `public`.
- `GET /wardrobe`: catálogo + itens do jogador + nível atual.
- `POST /wardrobe/:key/buy`, numa transação:
  - nível ≥ desbloqueio;
  - item ainda não comprado;
  - moedas ≥ preço;
  - desconto pelo `adjustWallet`.
  - Compra repetida em paralelo não cobra duas vezes (a chave primária garante).
- **O que está equipado** fica no perfil (`farminghabit.profile.v1`, já sincronizado): `pet` e `outfit`, cada um com a `key` do item ou vazio.

### Onde aparece

- **Configurações → Perfil, abaixo da carta**, numa grade do guarda-roupa. Cada item tem um de quatro estados:
  - **trancado:** apagado, com cadeado e "Nv X";
  - **liberado:** preço em moedas e botão de comprar;
  - **comprado:** "Usar";
  - **equipado:** "Tirar".
- **Na carta:** o pet equipado aparece ao lado da personagem; a roupa veste a personagem (também no `PixelAvatar`, então vale na Casa e no wizard).
- **Pet passeando:** de vez em quando o pet equipado atravessa a tela atual. É vida ambiente: some com "Vida no cenário" desligado e com movimento reduzido.
- **Ao subir de nível com item novo liberado:** o toast "Nível 5! Item novo no guarda-roupa" leva ao Perfil ao ser tocado.

### Arte

Os 6 itens são desenhos novos em pixel, no traço da personagem atual. Cada um é mostrado à autora para aprovação antes de entrar. A arte existente não é redesenhada.

---

## Fica para depois

- **Energia da personagem:** a semana aparece no ânimo da personagem (radiante numa semana boa, sonolenta com olheiras numa fraca) e o coach comenta com carinho. **Nunca pelo corpo:** "falhou, engordou" foi descartado, porque associa peso a fracasso e machuca justamente quem o app quer ajudar.
- Fofocas liberadas por nível.
- Amigos colecionando a carta uns dos outros (a carta já mostra o que um amigo veria: sequência e área mais cuidada).

## Pontos abertos

- Nomes, preços e níveis finais dos 6 itens (os da tabela são o ponto de partida).
- Lugar exato do pet passeando em cada tela (definido junto com a arte, na etapa 3).
