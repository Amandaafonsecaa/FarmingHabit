# FarmingHabit — Backend

API do FarmingHabit em NestJS 11, com Prisma 6 sobre o Postgres do Supabase e o Supabase Storage para a foto da motivação. Visão geral do projeto está no [README da raiz](../README.md).

## Configuração

Copie `.env.example` para `.env` e preencha:

- `DATABASE_URL`: conexão do runtime (session/direct ou transaction pooler com `?pgbouncer=true`)
- `DIRECT_URL`: conexão direta ou session pooler (porta 5432), usada pelas migrações
- `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: usadas só no backend; a service_role nunca vai para o frontend
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

## Recursos da API

Documentação interativa no Swagger, em `http://localhost:3000/api`.

- `/users`: jogadores, perfil, XP, moedas, motivação e armazenamento de dados por chave (`/users/:id/storage`)
- `/habits`: hábitos e progresso
- `/missions`: missões, com conclusão e desfazer conclusão
- `/rewards`: catálogo da loja, resgate (`/rewards/:id/claim`) e compras (`/purchases`)

O catálogo fixo da loja está em `src/rewards/catalog.ts` e é gravado no banco a cada inicialização do servidor.
