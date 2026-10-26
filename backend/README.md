<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Loja: vitrine, compras e itens aproveitados

A vitrine fixa é definida em `src/rewards/catalog.ts` e sincronizada por chave estável na inicialização. Os itens pessoais pertencem ao jogador. O frontend consulta a vitrine do banco, sem duplicar o catálogo fixo nem debitar moedas por atualização direta do jogador.

- `GET /rewards?userId=<uuid>`: catálogo global e itens pessoais do jogador. O frontend mostra os disponíveis.
- `POST /rewards`: cria item pessoal (`title`, `price`, `userId`, `description` opcional).
- `PATCH /rewards/:id`: altera ou retira um item pessoal da vitrine; envie o `userId` proprietário no corpo. O catálogo fixo é gerenciado pelo servidor.
- `POST /rewards/:id/claim?userId=<uuid>`: compra por UUID ou chave fixa. O preço vem do banco. Débito e histórico são gravados numa transação serializável, com repetição limitada em conflitos de concorrência. Uma mesma recompensa pode ser comprada novamente.
- `GET /purchases?userId=<uuid>`: histórico persistido, mais recente primeiro. Título e preço são fotografias do momento da compra, preservadas mesmo após editar/ocultar a recompensa.
- `PATCH /purchases/:id?userId=<uuid>` com `{ "used": true }`: marca como aproveitado e grava `usedAt`. Enviar `false` desfaz e limpa a data; isso não devolve moedas. Repetir o mesmo estado preserva a data anterior.

“Aproveitado” corresponde ao uso pessoal no frontend; não há etapa de aprovação por administrador. O desejo do cofrinho permanece local. Compras antigas existentes apenas no `localStorage` não são importadas automaticamente e não são apagadas. Compras novas feitas tanto na Casa quanto na Loja são persistidas no backend.

A aplicação ainda não implementa autenticação. A loja valida propriedade pelo `userId` informado, mas esse identificador não substitui uma identidade autenticada. Ao adicionar login, derive o jogador do token verificado em vez de aceitar identidade do cliente.

### Prisma 6 e Supabase

Copie `.env.example` para `.env` e configure `DATABASE_URL` e `DIRECT_URL` usando as strings PostgreSQL do painel Connect do Supabase. Não use a URL HTTP nem chaves `anon`/`service_role` como conexão Prisma. A conexão de migrations deve ser direta ou session pooler, não transaction pooler. Sem `DIRECT_URL`, a CLI usa `DATABASE_URL`, que deve então suportar migrations.

```sh
npm run prisma:generate
npm run db:deploy
npm test -- --runInBand
npm run build
```

A migration `20261025230000_shop_purchases` cria histórico e chave do catálogo. `20261026000000_shop_integrity` adiciona restrições para preços não negativos e consistência entre `used` e `usedAt`, sem apagar dados.

Teste de integração opcional no banco configurado:

```sh
npm run test:shop:integration
```

Esse teste cria dois jogadores temporários, verifica compras concorrentes, histórico, propriedade e uso/desuso, sincroniza a vitrine fixa e remove apenas os próprios jogadores ao terminar. Não execute contra um banco que não permita criar dados temporários.

Referências: [Prisma 6: configuração e conexão direta](https://docs.prisma.io/docs/orm/v6/reference/prisma-config-reference), [Supabase com Prisma](https://supabase.com/docs/guides/database/prisma).
