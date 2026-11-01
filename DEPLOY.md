# FarmingHabit: primeiro deploy gratuito

Guia preparado em 31/10/2026 para o repositório atual. Plataforma sugerida: Render Static Site (frontend), Render Free Web Service com Docker (backend), Supabase Free (banco, Auth e Storage). A branch local atual é `deploy`.

Isso atende um primeiro lançamento/beta dentro das cotas. Não equivale a infraestrutura paga sempre disponível. O Render informa que é possível criar serviços gratuitos sem pagamento; exigências de verificação de conta podem variar. Não contrate instância paga nem cadastre cartão para seguir este guia.

## 1. Entenda os três endereços

- Site: URL HTTPS do Static Site, por exemplo `https://farminghabit.onrender.com`.
- API: URL HTTPS do Web Service, por exemplo `https://farminghabit-api.onrender.com`.
- Supabase: URL HTTPS do seu projeto existente, por exemplo `https://SEU-PROJETO.supabase.co`.

Os nomes dos serviços são exemplos: use sempre as URLs reais fornecidas pelos painéis. Docker empacota a API; o Render executa o container. O computador pode ficar desligado depois do deploy. O Docker Compose continua sendo útil localmente, mas não é enviado como uma pilha ao Render neste fluxo.

## 2. Prepare o código no GitHub

O remoto encontrado foi `https://github.com/Amandaafonsecaa/FarmingHabit.git`. Confirme no GitHub que a branch `deploy` contém o código que quer publicar. Não é necessário tornar o repositório público.

Na pasta raiz:

```sh
git status
git branch --show-current
git diff -- backend/Dockerfile backend/src/main.ts
git check-ignore backend/.env frontend/.env
```

Os arquivos `.env` devem continuar ignorados. Não coloque senhas, tokens, `service_role` nem conexão PostgreSQL em arquivos versionados.

Os ajustes preparados neste atendimento foram: geração do Prisma durante o build com URL fictícia, servidor escutando em `0.0.0.0` e um modelo de variáveis públicas do frontend.

Depois de revisar:

```sh
git add backend/Dockerfile backend/src/main.ts frontend/.env.example DEPLOY.md
git commit -m "Prepare Docker backend and deployment guide"
git push origin deploy
```

Se houver outras alterações que você queira publicar, revise e inclua os arquivos correspondentes antes. Não use `git add .` sem conferir o que está sendo incluído.

## 3. Confira o Supabase existente

Abra seu projeto no Supabase e mantenha o plano Free. Se estiver pausado, restaure-o no painel.

Em Connect, copie a URI de **Session pooler**, porta **5432**. Ela funciona em redes IPv4 e serve para este backend persistente e para migrations. Copie o hostname do painel; não invente o nome do pooler.

Exemplo ilustrativo:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:SENHA_CODIFICADA@HOST_DO_POOLER:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.PROJECT_REF:SENHA_CODIFICADA@HOST_DO_POOLER:5432/postgres?sslmode=require"
```

As duas podem ser a mesma conexão session-mode neste primeiro deploy. A senha é a senha do banco, não a senha do login do painel, nem uma chave anon/service_role. Caracteres especiais na senha precisam de codificação URL. Não cole credenciais em sites de codificação.

Separe também a URL HTTP do projeto, a chave pública anon e a chave secreta service_role existentes. A chave pública vai ao frontend; service_role e conexão de banco ficam somente no backend.

## 4. Aplique migrations a partir do computador

Configure `backend/.env` localmente com as conexões reais. Execute a partir da raiz:

```sh
cd backend
npm ci
npm run prisma:generate
npm run db:status
npm run db:deploy
npm run db:storage
cd ..
```

`db:status` pode retornar código de saída diferente de zero apenas por haver migrations pendentes. `db:deploy` é a etapa que aplica essas migrations. `db:storage` prepara o bucket privado `motivation-photos` e suas políticas. Não use `prisma migrate reset` ou `db push --accept-data-loss`.

As migrations são manuais neste projeto. A imagem final da API não inclui a CLI do Prisma: ela foi removida com as dependências de desenvolvimento. Não configure `npx prisma migrate deploy` como comando de inicialização do container.

## 5. Crie a conta no Render e publique a API

Entre em `https://dashboard.render.com`, conecte sua conta GitHub e dê acesso ao repositório FarmingHabit.

Escolha New → Web Service e selecione o repositório.

| Campo | Valor |
|---|---|
| Name | `farminghabit-api`, ou nome disponível |
| Branch | `deploy` |
| Root Directory | `backend` |
| Language / Runtime | `Docker` |
| Dockerfile Path | `./Dockerfile`, relativo à raiz `backend` |
| Docker Build Context, se aparecer | `.` |
| Instance Type | `Free` |
| Docker Command | Deixe vazio: usa o CMD do Dockerfile |

Não configure build/start commands de Node para esse serviço Docker. Se o painel mostrar um Health Check Path customizado, deixe-o sem configuração neste primeiro deploy: as rotas atuais exigem autenticação. Use a detecção padrão de porta.

Cadastre estas variáveis em Environment. Nos campos do painel, cole os valores sem as aspas do arquivo `.env`:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URI PostgreSQL session pooler |
| `DIRECT_URL` | URI de migrations, session pooler |
| `SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta service_role do seu projeto |
| `CORS_ORIGIN` | Por enquanto `http://localhost:5173,http://localhost:8080`; atualize no passo 7 |

Deixe o Render definir `PORT`. O backend já lê essa variável e escuta em `0.0.0.0`.

`SUPABASE_JWT_SECRET` só é necessário se o projeto realmente usar tokens HS256 antigos. Projetos ES256/RS256 são verificados pelas chaves públicas do projeto. Não use a chave anon ou service_role como JWT Secret.

Crie o serviço e acompanhe os logs. No final, copie a URL pública da API. Ela será usada no frontend.

Para testar sem enviar credenciais:

```sh
curl -i https://SUA-API.onrender.com/users/me
```

Receber HTTP 401 com uma mensagem pedindo login é esperado nesse teste: a rota existe e exige token. Uma tela de erro do Render ou HTTP 502/503 não é o resultado esperado. `/api` não estará disponível: o Swagger é desativado em produção no código atual.

## 6. Publique o frontend como Static Site

No Render, escolha New → Static Site e selecione o mesmo repositório.

| Campo | Valor |
|---|---|
| Name | `farminghabit`, ou nome disponível |
| Branch | `deploy` |
| Root Directory | `frontend` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |

Neste caminho não se usa o Dockerfile do frontend. O Render entrega os arquivos compilados por CDN, sem gastar uma instância de backend para servir HTML/CSS/JS.

Antes do build, cadastre:

```dotenv
VITE_API_URL=https://SUA-API.onrender.com
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_ANON
```

Esses valores são públicos. Nunca crie variáveis `VITE_DATABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE_KEY` ou equivalentes secretas. O endereço de API precisa ser a URL pública HTTPS; `localhost:3000` ou `http://backend:3000` não funcionam para os usuários do site.

Crie o Static Site e copie sua URL pública. Sempre que mudar uma variável VITE, faça um novo build/deploy: os valores são incorporados no JavaScript.

## 7. Autorize o domínio real no backend

No serviço da API, altere `CORS_ORIGIN` para a URL real do frontend, sem barra no fim:

```dotenv
CORS_ORIGIN=https://SEU-SITE.onrender.com
```

Se quiser continuar desenvolvendo localmente:

```dotenv
CORS_ORIGIN=https://SEU-SITE.onrender.com,http://localhost:5173,http://localhost:8080
```

Salve e deixe o Render reiniciar/republicar a API. HTTPS do site e HTTPS da API são indispensáveis para evitar bloqueio de conteúdo misto.

## 8. Configure os retornos de autenticação no Supabase

Em Authentication → URL Configuration:

- Site URL: a URL pública real do frontend.
- Redirect URLs: adicione essa mesma URL; mantenha URLs locais apenas se ainda as usa.

Não coloque a URL do backend como Site URL. Para este app, o usuário volta para o frontend depois da confirmação de e-mail. Use o domínio publicado real, não placeholders.

## 9. Resolva os e-mails antes de convidar usuários

O envio padrão do Supabase é para testes: envia apenas a endereços da equipe e tem cota baixa. Assim, hospedar o app não basta para liberar cadastros com confirmação para qualquer e-mail.

Mantenha a confirmação de e-mail ligada para um lançamento público. Desativá-la permite cadastrar endereços que não pertencem à pessoa.

Uma possibilidade sem custo de domínio para um beta pequeno é configurar SMTP com uma conta Gmail elegível. Isso depende das regras da conta e não oferece garantia de entrega/volume para um produto em escala:

1. Use preferencialmente uma conta Gmail dedicada ao FarmingHabit.
2. Ative a verificação em duas etapas da conta Google.
3. Gere uma senha de app e mantenha-a secreta. Algumas contas não permitem esse recurso.
4. No Supabase, procure Authentication → Email / SMTP Settings e habilite SMTP personalizado.
5. Use `smtp.gmail.com`, porta 587, usuário igual ao Gmail completo, senha igual à senha de app e remetente igual ao Gmail utilizado. Nome do remetente: FarmingHabit. Se necessário, use a porta 465 conforme as opções de TLS do painel.
6. Teste o cadastro com um e-mail fora da equipe e confira caixa de entrada e spam. Consulte os logs do Supabase Auth se falhar.

Não use a senha comum do Gmail. Não configure esse SMTP no Render: quem envia a confirmação é o Supabase. As cotas do Gmail e do Supabase continuam valendo.

Se a conta Google não permitir senha de app, será preciso escolher outro SMTP ou outra forma de login. Provedores como Brevo têm plano gratuito, mas as exigências de remetente/domínio precisam ser verificadas; não conte com um domínio próprio gratuito garantido.

## 10. Teste a versão publicada

Abra uma aba anônima na URL do site e verifique:

- Cadastro com Nome, e-mail e senha; recebimento do e-mail e retorno ao site.
- Login e carregamento da Início sem CORS ou erro de sessão.
- Criar e editar uma meta; atualizar a página e conferir persistência.
- Criar uma missão, concluí-la e conferir XP/moedas sem crédito duplicado.
- Criar recompensa, editar, comprar e marcar como aproveitada.
- Sair e entrar novamente; conferir que os dados continuam na conta correta.
- Fotos da motivação, caso vá disponibilizar essa função.
- Tela pequena/celular e, depois, acesso com o computador desligado.

Não publique credenciais ou tokens ao pedir ajuda. Compartilhe somente mensagens de erro, nomes de variáveis e URLs públicas.

## 11. Entenda os limites gratuitos

- Render Free Web Service: dorme após 15 minutos de inatividade e pode levar aproximadamente um minuto para voltar. O primeiro acesso pode ficar lento.
- Static Site: servido como conteúdo estático por CDN; é separado do processo da API.
- Render compartilha cotas de tráfego e build; sem forma de pagamento, atingir limites pode suspender os serviços em vez de gerar cobrança.
- Supabase Free pode pausar projetos com pouca atividade por cerca de uma semana; restaure pelo painel quando necessário.
- Use os subdomínios gratuitos `onrender.com`. Domínio próprio é opcional e normalmente custa dinheiro.
- Não substitua seu Supabase por Render Postgres Free: o plano gratuito desse banco tem prazo de expiração e não é o caminho deste guia.

Se algum cadastro exigir cartão como verificação, pare nessa etapa e confira a exigência antes de aceitar. Este guia não depende de contratar plano pago. Não é possível garantir que verificações de conta ou políticas gratuitas nunca mudem.

## 12. Próximas atualizações

Com os serviços ligados à branch `deploy`, pushes nessa branch podem disparar novos deploys. Alterações de banco devem ser aplicadas por `npm run db:deploy` antes de publicar código que dependa delas. Mudança em VITE exige rebuild; mudança no backend exige reinicialização/deploy da API.

## Diagnóstico rápido

| Sintoma | Conferir |
|---|---|
| Prisma exige DATABASE_URL no build | Dockerfile atualizado e commit correto no GitHub |
| P1001 / banco inacessível | Projeto ativo, Session pooler, porta 5432, senha e host copiados do painel |
| Erro de CORS | CORS_ORIGIN com a URL exata do frontend |
| Navegador chama localhost | VITE_API_URL e novo build do frontend |
| Sessão inválida ou indisponível | SUPABASE_URL do mesmo projeto usado no frontend; logs da API |
| Cadastro não envia e-mail | SMTP personalizado, remetente, cotas e logs do Supabase Auth |
| 502/503 após publicação | Logs da API, porta, conexão do banco e reinício do serviço |
| Primeira visita lenta após uma pausa | Cold start do backend gratuito |
| Foto não salva | Bucket motivation-photos e SUPABASE_SERVICE_ROLE_KEY somente no backend |

## Referências oficiais

- https://render.com/docs/your-first-deploy
- https://render.com/docs/free
- https://render.com/docs/static-sites
- https://render.com/docs/docker
- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://support.google.com/mail/answer/185833?hl=pt-BR
- https://developers.google.com/workspace/gmail/imap/imap-smtp
