# FarmingHabit — Backend

API do FarmingHabit em NestJS 11, com Prisma 6 sobre o Postgres do Supabase e o Supabase Storage para a foto da motivação. Visão geral do projeto está no [README da raiz](../README.md).

## Configuração

Copie `.env.example` para `.env` e preencha:

- `DATABASE_URL`: conexão do runtime (session/direct ou transaction pooler com `?pgbouncer=true`)
- `DIRECT_URL`: conexão direta ou session pooler (porta 5432), usada pelas migrações
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: usadas só no backend; a service_role nunca vai para o frontend
- `SUPABASE_JWT_SECRET`: opcional, só para projetos antigos com login em HS256. Projetos novos são verificados pela JWKS do `SUPABASE_URL`
- `PORT`: padrão `3000`

## Scripts

```bash
npm run start:dev       # desenvolvimento com recarga automática
npm run build           # compila para dist/
npm run start:prod      # roda o build
npm run db:deploy       # aplica as migrações (prisma migrate deploy)
npm run db:status       # estado das migrações
npm run db:storage      # cria o bucket de fotos (prisma/supabase/motivation-storage.sql)
npm test                # testes unitários (Jest)
npm run test:e2e        # testes end-to-end
npm run test:shop:integration  # teste da loja no banco real; cria e remove os próprios dados
npm run lint
```

## Autenticação

Todas as rotas exigem `Authorization: Bearer <access_token>` do Supabase Auth. O `AuthGuard` (`src/auth/`) confere o token e cria o jogador no primeiro acesso. O backend nunca recebe o id do jogador na URL ou no corpo: ele sai do token (`@CurrentUser()`).

## Recursos da API

Documentação interativa no Swagger, em `http://localhost:3000/api` (o botão Authorize aceita o token).

- `/users/me`: perfil, XP, moedas, nome, motivação (`/users/me/motivation`), dados sincronizados (`/users/me/storage`) e apagar partes dos dados (`/users/me/data`)
- `/habits`: hábitos do jogador e progresso
- `/missions`: missões do jogador e globais, com conclusão e desfazer conclusão
- `/rewards`: vitrine, resgate (`/rewards/:id/claim`)
- `/purchases`: histórico de compras do jogador
- `/progress`: ganhos calculados pelo servidor. Colher meta do dia (`POST /progress/harvest`), abrir baú da jornada (`POST /progress/chests/:id/open`) e consultar o que foi pago (`GET /progress/claims`)

Moedas, XP e nível só mudam por essas ações conferidas no servidor; o `PATCH /users/me` aceita apenas o nome.

## Banco

Todas as tabelas têm RLS ligado e nenhuma permissão para o papel `anon`: a API pública do Supabase não lê nem grava os dados do jogo. O backend acessa como `postgres` (dono das tabelas). Toda migração que criar tabela precisa ligar o RLS e revogar o `anon`. Aplique migrações com `npm run db:deploy` (não use `migrate dev`).

O catálogo fixo da loja está em `src/rewards/catalog.ts` e é gravado no banco a cada inicialização do servidor.
