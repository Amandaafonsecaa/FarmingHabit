# FarmingHabit — instruções para agentes

## Escopo e fontes de verdade

Este arquivo se aplica ao repositório inteiro. FarmingHabit é um tracker de hábitos gamificado com atmosfera de fazendinha cozy e pixel art original. Interface, mensagens e exemplos devem permanecer em português brasileiro.

Leia os arquivos relevantes antes de editar. O código atual é a fonte de verdade para comportamento; comentários antigos e histórico da conversa podem descrever recursos removidos. Consulte também `README.md`, `frontend/README.md`, `backend/README.md`, `CLAUDE.md` e `DEPLOY.md`, sem copiar regras desatualizadas sobre a mecânica.

Não refaça a composição visual aprovada quando o pedido for pontual. Preserve alterações existentes do usuário e não reverta arquivos fora da tarefa.

## Estrutura

Existem dois projetos npm independentes; não existe workspace/package.json na raiz.

| Diretório | Responsabilidade |
|---|---|
| `frontend/` | React 19, TypeScript, Vite e Tailwind CSS v4 |
| `frontend/src/pages/` | Início, Metas, Missões, Loja, Diário, Evolução e Configurações |
| `frontend/src/components/` | Componentes, cenários SVG e modais |
| `frontend/src/hooks/` | Estado e integração das funcionalidades |
| `frontend/src/lib/` | Regras puras, datas, autenticação e sincronização |
| `frontend/src/services/api.ts` | Contratos e chamadas HTTP autenticadas |
| `frontend/src/styles/` | CSS por funcionalidade; tokens em `global.css` |
| `backend/` | API NestJS 11, Prisma 6 e PostgreSQL do Supabase |
| `backend/src/auth/` | Verificação de JWT e identidade autenticada |
| `backend/src/goals/` | Check-ins e pagamento de metas |
| `backend/src/missions/` | Missões, conclusão e desfazer conclusão |
| `backend/src/rewards/` | Catálogo, personalizações e compras |
| `backend/src/progress/` | Economia, níveis, carteira e livro-caixa |
| `backend/src/users/` | Jogador, dados sincronizados, motivação e ajustes da conta |
| `backend/prisma/` | Schema, migrations e configuração do Storage |

## Comandos e verificações

Na raiz, use `--prefix` ou execute dentro da pasta correspondente:

```sh
npm ci --prefix frontend
npm run dev --prefix frontend
npm run typecheck --prefix frontend
npm run build --prefix frontend

npm ci --prefix backend
npm run prisma:generate --prefix backend
npm run start:dev --prefix backend
npm run build --prefix backend
npm test --prefix backend -- --runInBand
```

- Frontend local: normalmente `http://localhost:5173`; backend: `http://localhost:3000`.
- Teste Jest direcionado: `npm test --prefix backend -- --runInBand nome-do-teste`.
- `npm run lint --prefix backend` modifica arquivos com `--fix`; não o execute indiscriminadamente em mudanças pontuais.
- `npm run test:shop:integration --prefix backend` escreve no Supabase real configurado, cria/remove fixtures e pode usar a API administrativa de Auth. Leia o teste antes de executar; não o trate como teste isolado em memória.
- `npm run db:status --prefix backend` consulta migrations; `npm run db:deploy --prefix backend` as aplica ao banco configurado.
- `npm run db:storage --prefix backend` configura o bucket privado de fotos de motivação.
- Docker local: `docker compose up --build -d`; migrations sob demanda: `docker compose run --rm migrate`.
- Rode checks proporcionais à mudança. Para documentação, confira os caminhos, regras e exemplos; não é necessário reconstruir a aplicação.
- Em UI, confira desktop, celular, estados vazios, textos longos e interações de teclado. Informe explicitamente quando não houver navegador para validação visual.

## Mecânica do jogo — comportamento atual

### Ciclo principal

A pessoa cria sua conta, personaliza a personagem, planta metas recorrentes e registra o progresso real. Cumprir metas ou missões concede XP e moedas. O XP aumenta o nível; moedas compram recompensas pessoais na Loja. Diário e Evolução ajudam a acompanhar a jornada.

O jogo não é uma fazenda de produção de recursos: não existe economia automática de plantações, venda de colheitas, multiplayer ou progressão por tempo de tela implementados. A metáfora visual não deve ser confundida com uma mecânica que concede saldo.

### Conta e começo da jornada

- Cadastro por Supabase Auth, com nome, e-mail e senha de pelo menos 6 caracteres.
- A confirmação por e-mail depende da configuração de Auth/SMTP do projeto.
- O backend verifica o JWT e cria o jogador no primeiro acesso autenticado; usa o nome do cadastro quando disponível.
- O jogador novo começa no nível 1, com 0 XP e 0 moedas (`backend/prisma/schema.prisma`).
- O onboarding permite configurar a personagem; não concede moedas ou XP por si só.
- Avatar, preferências e dados de jogo pertencem à conta. Não misture dados entre usuários ao sair/entrar.

### Metas e hábitos

Fontes: `frontend/src/types/goals.ts`, `frontend/src/lib/goalLogic.ts`, `frontend/src/hooks/useGoalTracker.ts`, `backend/src/goals/services/goals.service.ts`.

- Frequências: todo dia; N vezes por semana; ou dias específicos da semana.
- A semana vai de segunda a domingo.
- Medidas: check único ou quantidade com alvo, unidade e passo.
- Exemplo: água com alvo 8 copos só conclui o dia ao atingir pelo menos 8; 7 copos ainda não completam a meta.
- Meta semanal de 5 vezes significa 5 dias concluídos na semana, não 5 cliques no mesmo dia.
- Categorias: Saúde, Estudos, Vida pessoal, Lazer e Sem categoria.
- Exemplos iniciais: leitura e inglês em Estudos; academia e água em Saúde. Não sobrescreva categorias escolhidas nem metas editadas ao migrar exemplos antigos.
- Modos: construir hábito (`build`) e largar hábito (`quit`). O segundo registra recaídas e calcula dias sem o hábito; não acrescente uma penalidade financeira inexistente.
- Sequências: metas diárias/dias específicos contam dias agendados consecutivos; semanais contam semanas com o alvo atingido. O período atual ainda aberto não quebra sozinho a sequência.
- Uma meta de hoje atingida paga **5 moedas + 5 XP** uma vez por jogador/meta/dia.
- Uma meta semanal que alcança seu alvo também paga **15 moedas + 10 XP**, uma vez por jogador/meta/semana.
- O pagamento está no check-in do servidor, não na animação da planta.
- Desmarcar e remarcar uma meta no mesmo dia não paga novamente. O ledger impede duplicação.
- Histórico antigo/importado pode ser preservado sem receber moedas/XP retroativos. Check-ins de datas passadas não devem criar ganhos de hoje.

Exemplo: academia 5 vezes na semana, com cada dia cumprido, rende 25 moedas e 25 XP pelas cinco colheitas. Ao atingir a semana, soma 15 moedas e 10 XP: **40 moedas e 35 XP** nesse exemplo, sem outros ganhos.

### Horta e dia perfeito

Fontes: `frontend/src/pages/HomePage.tsx`, `frontend/src/components/WorldScenery.tsx`, `frontend/src/components/GameWorld.tsx`.

- A horta representa as metas que cobram hoje, incluindo as regras de semanais já atingidas.
- No código atual, tocar na planta é uma interação visual; não deve virar outro caminho para duplicar colheitas. O cumprimento é registrado pelos controles de metas.
- Cumprir todas as metas previstas do dia permite a comemoração de dia perfeito: arco-íris e pétalas, respeitando as preferências de celebração/movimento.
- Essa comemoração é visual: não invente bônus adicional de moedas/XP.
- Diferencie os canteiros decorativos que evoluem com o nível dos indicadores de progresso das metas.

### XP e níveis, com exemplos

Fonte principal: `backend/src/progress/economy.ts`. A carteira é atualizada por `backend/src/progress/wallet.ts`.

```text
XP_PER_LEVEL = 100
nível = floor(max(XP_total, 0) / 100) + 1
XP_na_barra = XP_total % 100
```

| XP total | Nível | Progresso para o próximo nível |
|---:|---:|---:|
| 0 | 1 | 0/100 XP |
| 95 | 1 | 95/100 XP |
| 100 | 2 | 0/100 XP |
| 250 | 3 | 50/100 XP |
| 400 | 5 | 0/100 XP |

- O banco guarda XP acumulado; não zere o total ao subir de nível.
- Não confunda progresso da barra com XP total.
- Exemplo: jogador com 95 XP cumpre uma meta de 5 XP, chega a 100 XP e sobe para o nível 2.
- Exemplo: jogador com 90 XP cumpre missão de 50 XP, chega a 140 XP: nível 2, barra em 40/100.
- Ganhar nível não concede automaticamente moedas extras.
- A horta decorativa tem estágio 1 no nível 1, estágio 2 no nível 2 e estágio 3 a partir do nível 3; a partir do nível 5 recebe aparência dourada. Confirme `WorldScenery.tsx` antes de alterar esses marcos.
- Não existe teto de nível declarado nessa fórmula; não invente um.

### Missões

Fontes: `frontend/src/hooks/useMissionBoard.ts`, `frontend/src/components/dialogs/MissionDialog.tsx`, `backend/src/missions/`.

| Preset | XP | Moedas |
|---|---:|---:|
| Passinho | 20 | 15 |
| Desafio | 50 | 30 |
| Conquista | 120 | 80 |

- A recompensa personalizada respeita os limites reais do backend: XP de 1 a 120; moedas de 0 a 80 (`MISSION_LIMITS`). Não amplie só os limites do formulário.
- Patentes visuais por XP: Exploração abaixo de 40; Aventura a partir de 40; Lendária a partir de 100. São patentes da missão, não níveis do jogador.
- Aceitar/partir coloca a missão em jornada; não concede ganhos. As missões aceitas são estado sincronizado da conta.
- Cumprir registra conclusão/data e credita a recompensa numa transação. Requisições simultâneas não podem pagar a mesma conclusão duas vezes.
- Desfazer uma missão retira suas recompensas e reabre a missão. A carteira nunca fica negativa, e o nível é recalculado pelo XP restante. Essa regra é diferente de desmarcar uma meta diária.
- Recompensas de missão concluída ficam travadas até desfazer, evitando alterar o valor antes de devolver os ganhos.
- Título: até 60 caracteres. Descrição: até 160. Verificar DTO e formulário juntos.
- Os pergaminhos compactos não exibem a descrição completa; o modal de detalhes permite consultar/editar. Use o shell compartilhado.

### Loja, favoritos, compras e uso

Fontes: `backend/src/rewards/catalog.ts`, `backend/src/rewards/services/`, `frontend/src/hooks/useShop.ts`, `frontend/src/lib/shop.ts`.

- Catálogo fixo global: sincronizado por chave estável (`key`) na inicialização da API.
- Recompensas pessoais: criadas pela pessoa, com nome, descrição/preço conforme o formulário/API.
- Alterar um item global só personaliza a vitrine do jogador via `RewardOverride`; não altera o catálogo de outros usuários.
- Apagar/retirar da vitrine preserva as compras anteriores. A sincronização do catálogo não deve reexibir itens ocultados pessoalmente.
- Favoritos são marcados com coração. Na vitrine da Início, priorizar favoritos, depois personalizados, depois os demais; mostrar itens mesmo sem saldo para comprá-los.
- A compra consulta o preço no servidor, valida disponibilidade e saldo, debita moedas e registra histórico na mesma transação.
- Não aceite preço ou saldo do frontend como autoridade. Não deixe duplo clique ou concorrência gastar o mesmo saldo.
- Cada compra guarda título e preço da ocasião. Editar o catálogo depois não modifica o histórico.
- Um mesmo item pode ser comprado novamente como outra compra.
- A compra reduz moedas, não XP/nível. Exemplo: 100 moedas e um item de 60 deixam 40 moedas.
- Aproveitar um item marca `used` e `usedAt`. Desfazer o uso limpa a marca/data; não devolve moedas nem apaga a compra.
- Não existe aprovação administrativa separada: “aproveitado” é o estado de uso da recompensa.
- A Início também permite comprar pelo botão de moedas; usa o mesmo endpoint e o saldo retornado pelo servidor.

### Diário, Evolução e personagens

- Diário: registros por data, humor, notas e sequência de escrita; preserva as datas locais e os dados da conta.
- O clima emocional da janela do Diário é independente da fase do dia: chuva/tempestade/arco-íris podem coexistir com a paleta do horário.
- Pipoca, a gata do Diário, libera a conversa após ser acordada 3 vezes em 1 minuto (`frontend/src/lib/diaryCat.ts`).
- Seu Zé (Metas), Capitão (Missões), Bigode (Loja), Pipoca (Diário) e Coach Rocha (Evolução) usam diálogos contextuais. Conversar não concede ganhos por si só.
- Evolução resume dados reais: nível/XP, consistência, áreas e ganhos semanais. Os ganhos vêm dos claims pagos e das missões concluídas/data de conclusão, não de números demonstrativos.
- A motivação pode conter texto e foto; fotos usam o bucket privado `motivation-photos` e links assinados.
- Trocar aparência, anotar humor, mudar configurações ou ficar com o site aberto não são fontes automáticas de moedas/XP.

### Horários, estações e acessibilidade

Fonte: `frontend/src/lib/timeOfDay.ts`; atualização em `frontend/src/hooks/useNow.ts` e `useDayPhase.ts`.

| Fase | Horário local |
|---|---|
| Amanhecer | 05:00 até antes de 07:30 |
| Dia | 07:30 até antes de 17:00 |
| Entardecer | 17:00 até antes de 19:00 |
| Noite | 19:00 até antes de 05:00 |

- Compartilhar `SKY_PALETTES` entre os cenários; não duplicar horários/cores por página.
- Janelas internas mostram a paleta do horário, sem desenhar um sol/lua individual em cada janela.
- Estações seguem o hemisfério sul: primavera setembro–novembro; verão dezembro–fevereiro; outono março–maio; inverno junho–agosto.
- Preferências de movimento calmo, celebrações e bichinhos não podem alterar o resultado das regras financeiras.

### Mecânicas antigas não ativas

Baús, coleção de cartas e mapa de jornada antigos não são o fluxo atual. Alguns comentários/diálogos e registros `chest` permanecem como legado. Não reintroduzir esses recursos nem prometer recompensas deles sem pedido explícito. Distinguir dados históricos de funcionalidades disponíveis.

## Arquitetura, persistência e invariantes

- Supabase Auth autentica; NestJS verifica JWT por `AuthGuard` global e resolve o jogador com `@CurrentUser()`. Não confie em `userId` enviado pelo navegador.
- `User.id` corresponde ao UUID de Supabase Auth. Verifique migrations/triggers de vínculo antes de criar fixtures ou alterar contas.
- XP, moedas, nível e pagamentos são autoridade do servidor. `PATCH /users/me` não deve se tornar um endpoint livre de edição de saldo.
- `reward_claims` + chave por jogador/evento garantem pagamentos únicos. Não remova a proteção para fazer a UI “funcionar”.
- Definições de metas, perfil, diário, configurações e favoritos são blobs sincronizados em `UserData`; `cloudSync.ts` mantém o cache local e sincroniza por conta.
- Check-ins são relacionais em `goal_checkins`, com cache/fila offline em `frontend/src/lib/checkins.ts`. Não volte a gravar todo o histórico como um blob que sobrescreve outros dispositivos.
- Componentes que espelham chaves sincronizadas em state devem acompanhar mudanças por `useStorageChange`.
- Nova chave sincronizada precisa entrar nas listas correspondentes de frontend/backend e nos mecanismos de exportação/reset, quando aplicável.
- Revise importações, reset, offline e troca de conta ao mudar persistência.

## Design e comportamento da interface

- Reutilize `GameDialog`, `PixelIcon`, `CoinHud`, `GamePanel`, `pixel-frame`, `pixel-button`, `ProgressBar` e os toasts existentes.
- Use a paleta e tipografia monoespaçada do projeto; não transforme a interface em um dashboard genérico.
- Arte original: não copie sprites, personagens, mapas ou logos de jogos comerciais.
- Não redesenhe casa, personagem, ponte, horta, câmera ou cenário sem solicitação.
- Em cenários, use a base/pés como âncora de profundidade e ordene objetos por Y; não use z-index arbitrário para encobrir colisões.
- Metas, árvores, flores e estruturas precisam de contato coerente com o chão. Não posicione objetos na água, sobre caminhos ou atravessando cercas.
- Respeite a geometria de componentes equivalentes e limites de texto. Não deixe descrições longas esticarem cards de altura fixa.
- Contador de moedas: padrão superior direito; exceções atuais são Início no desktop (esquerda, devido aos cartões superiores) e Loja no celular (inferior direito, para não cobrir a placa).
- Modais mantêm animação, foco contido, retorno de foco e bloqueio durante ações assíncronas. Comprar, favoritar, abrir detalhes e apagar devem ser ações independentes.
- Feedback curto e amigável em pt-BR; erros de rede/configuração não devem ser apresentados falsamente como sessão expirada.

## Banco, segredos e deploy

- Nunca exiba, versione ou incorpore `.env`, tokens, senhas ou chaves administrativas nos artefatos públicos.
- `VITE_*` é público. Frontend usa URL da API, URL Supabase e chave pública; `service_role` e PostgreSQL ficam no backend.
- URLs Supabase de frontend/backend precisam apontar para o mesmo projeto.
- `CORS_ORIGIN` é a lista de origens exatas do frontend. Ao publicar em Vercel e Render, não deixe o navegador apontando para `localhost`.
- `DATABASE_URL` é runtime; `DIRECT_URL` é migrations. Use conexão direta/session pooler apropriada e confira rede/IPv4; não invente host de pooler.
- Use migrations versionadas e `migrate deploy`. Não execute resets destrutivos; não use `migrate dev` contra o projeto Supabase atual, que depende de objetos de Auth ausentes em um shadow database comum.
- Nova tabela pública deve habilitar RLS e revogar acesso direto de `anon` e `authenticated`, conforme o padrão das migrations atuais. O acesso aos dados de jogo passa pela API autenticada.
- Deploy deve usar a branch configurada no provedor; não assuma que `main` é a branch publicada. Consulte `DEPLOY.md` e a configuração real.
- Mudar `VITE_*` exige novo build; mudar variáveis do backend exige reinício/deploy. Não publique nem faça push sem escopo/autorização correspondente.

## Ao alterar regras de jogo

Confira backend, contratos HTTP, formulário, textos explicativos, estatísticas e documentação relacionados. Preserve pagamentos únicos, integridade da carteira e compatibilidade do histórico. Acrescente testes para regressões financeiras ou de autenticação; não crie testes que apenas reproduzem detalhes triviais da implementação.

Ao concluir, informe o que mudou, o que foi verificado e qualquer limitação real de validação. Este documento descreve o jogo implementado, não um roadmap: atualize-o quando essas regras forem alteradas.
