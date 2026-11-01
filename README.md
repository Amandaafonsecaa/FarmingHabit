# FarmingHabit

Tracker de hábitos gamificado com cara de fazendinha em pixel art, inspirado em Stardew Valley. A pessoa planta metas, cumpre missões, ganha XP e moedas e gasta as moedas na loja. A interface é em português brasileiro.

## Estrutura

```text
frontend/   Interface em React 19, Vite, Tailwind CSS v4 e TypeScript  (ver frontend/README.md)
backend/    API em NestJS 11, Prisma 6 e Supabase (Postgres + Storage)  (ver backend/README.md)
```

Os dois projetos são independentes, cada um com seu `package.json`. Não há workspace na raiz.

## Como rodar

Requisito: Node.js 22.12+ ou 24+ e npm.

1. **Backend**

   ```bash
   cd backend
   cp .env.example .env   # preencha as URLs do Supabase e a service_role
   npm ci
   npm run db:deploy      # aplica as migrações no banco
   npm run start:dev      # http://localhost:3000 (Swagger em /api)
   ```

2. **Frontend**, em outro terminal

   ```bash
   cd frontend
   npm ci
   npm run dev            # http://localhost:5173
   ```

O frontend fala com `http://localhost:3000` por padrão. Para outro endereço, defina `VITE_API_URL` em `frontend/.env`.

O login usa o Supabase Auth: no painel do projeto, deixe o provedor **Email** ligado e configure a **Site URL** (e as Redirect URLs) para o endereço do frontend, pois é para lá que o link de confirmação do cadastro volta. O frontend precisa de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; o backend, de `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

## Rodando com Docker

Com o Docker Desktop aberto e os arquivos `backend/.env` e `frontend/.env` preenchidos (os mesmos do desenvolvimento):

```bash
docker compose up --build -d      # sobe a API (porta 3000) e o site (porta 8080)
docker compose run --rm migrate   # aplica as migrações pendentes no banco (só quando houver)
docker compose logs -f backend    # acompanha os logs da API
docker compose down               # desliga tudo
```

Abra http://localhost:8080. Alguns cuidados:

- **Banco**: no `backend/.env`, use o pooler do Supabase (`aws-0-<região>.pooler.supabase.com:5432`, usuário `postgres.<projeto>`). O endereço direto `db.<projeto>.supabase.co` é só IPv6 e não conecta de dentro do container.
- **Variáveis do site**: as `VITE_*` do `frontend/.env` entram no build. Ao mudar alguma, rode `docker compose up --build` de novo.
- **Confirmação de e-mail**: no Supabase (Authentication → URL Configuration), inclua `http://localhost:8080` nas Redirect URLs, senão o link do cadastro abre a porta 5173.
- **Segredos**: o `backend/.env` chega ao container pelo `env_file` do compose e não entra na imagem (`.dockerignore`).

## Documentação para agentes

O arquivo [AGENTS.md](AGENTS.md) reúne as instruções para trabalhar no projeto e uma seção de mecânica do jogo, com regras e exemplos de metas, missões, moedas, XP e níveis.

O arquivo [CLAUDE.md](CLAUDE.md) tem os comandos, a arquitetura e as diretrizes de design (pixel art, sistema visual e critérios de UX) usados no desenvolvimento.
