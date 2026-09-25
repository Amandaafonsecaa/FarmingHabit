# Meu pequeno jardim

Uma página inicial de hábitos e bem-estar com React, TypeScript, Vite e Tailwind CSS. Interface em português brasileiro, ilustrações vetoriais originais inspiradas em pixel art e layout responsivo.

## Instalar e executar

Requisito: Node.js 22.12+ ou 24+ e npm.

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite (normalmente http://localhost:5173).

```bash
npm run typecheck # Verifica os tipos
npm run build     # Verifica os tipos e gera dist/
npm run preview   # Serve a versão de produção localmente
```

Para uma instalação reproduzível a partir do arquivo de lock, use `npm ci`.

## Estrutura

```text
public/                 Ícone local do site
src/
  assets/               Espaço para imagens e fontes locais
  components/           Cards, lista de hábitos, barras, ícones e ilustrações
  pages/HomePage.tsx    Única página; composição, missões e recompensas locais
  layouts/              Cabeçalho, conteúdo principal e rodapé
  lib/supabase.ts        Cliente Supabase e teste manual de conexão
  styles/global.css     Tailwind, cores reutilizáveis e estilos compartilhados
  types/                Tipos de interface; world.ts define metas, missões e recompensas
  data/world.ts         Dados fictícios do jogador, metas, missões e recompensas
  App.tsx               Entrada da página
  main.tsx              Inicialização do React e importação do CSS
```

## Decisões e escopo

- Tailwind CSS usa `@tailwindcss/vite` em `vite.config.ts`. Os tokens são definidos com `@theme` em `src/styles/global.css`, seguindo a configuração CSS do Tailwind; não é necessário `tailwind.config.js`.
- Não há roteador porque existe apenas uma página.
- O mundo ilustrado fica acima de exatamente três painéis: metas, missões e moedas/recompensas. Em desktop, a cena ocupa aproximadamente dois terços da composição; em telas menores, os painéis se empilham abaixo dela. Alturas mínimas preservam a legibilidade em janelas baixas.
- Concluir uma missão concede XP e moedas uma única vez. Desmarcar mantém as recompensas já recebidas; reconcluir não as duplica. Recompensas descontam moedas apenas uma vez e ficam indisponíveis quando o saldo é insuficiente. Os controles Adicionar meta, Adicionar missão e Adicionar compra abrem formulários locais na mesma página. Não há navegação para outra página.
- O estado é apenas em memória: recarregar restaura os dados fictícios. Não há persistência, API, banco de dados ou autenticação.
- As metas mantêm percentuais fictícios: marcar conclui em 100%, e desmarcar restaura o progresso anterior. Missões são objetivos de maior duração, com descrição, XP, moedas e checkbox.
- O avatar e o jardim são SVGs originais em componentes TSX. Fontes do sistema evitam dependências e requisições externas.
- Controles possuem foco de teclado, ações concluídas ficam desabilitadas e uma região de status anuncia resultados. As barras expõem progresso para tecnologias assistivas. Transições respeitam preferência por movimento reduzido.
- Sem páginas adicionais, análises, inventário ou funcionalidades futuras.

## Verificação

A compilação de produção e a checagem de tipos devem passar. A integração do Tailwind pode ser confirmada no CSS gerado em `dist/assets/`. Para revisão manual: abra a página em telas pequenas e grandes; use Tab e Enter para concluir missões, adicionar metas/missões/compras e resgatar recompensas; confirme XP e moedas, o bloqueio de ações repetidas e o retorno aos dados iniciais ao recarregar.

## Supabase: configuração inicial

1. Acesse o [painel do Supabase](https://supabase.com/dashboard), crie uma organização se necessário e selecione **New project**. Escolha nome, região e uma senha para o banco; aguarde o provisionamento. A senha do banco não deve ser usada no frontend.
2. No projeto, abra **Connect** e copie a **Project URL** para `VITE_SUPABASE_URL`.
3. Em **Settings → API Keys**, procure a seção de chaves legadas (**Legacy anon, service_role API keys**) e copie somente a chave **anon / public** para `VITE_SUPABASE_ANON_KEY`. O Supabase também oferece chaves publishable; esta configuração mantém a chave anônima solicitada. Consulte a [documentação das chaves](https://supabase.com/docs/guides/getting-started/api-keys).
4. Na raiz do projeto, execute:

   ```bash
   cp .env.example .env
   npm install
   ```

5. Preencha as duas variáveis no `.env` e execute `npm run dev`. Reinicie o Vite sempre que alterar as variáveis.

`src/lib/supabase.ts` exporta `supabase`, inicializado quando ambas as variáveis estão preenchidas; sem configuração, ele é `null`. Ao usá-lo futuramente, verifique esse caso. A página atual continua usando dados fictícios e não importa o cliente. Os tipos futuros do banco ficarão em `src/types/`, após a definição do modelo.

### Teste manual de conexão

Com o servidor de desenvolvimento aberto no navegador, execute no console das ferramentas de desenvolvedor:

```js
const { supabase, checkSupabaseConnection } = await import('/src/lib/supabase.ts');
console.log('Cliente configurado:', supabase !== null);
console.log(await checkSupabaseConnection());
```

Esse caminho é específico do servidor de desenvolvimento do Vite. A função retorna `{ ok, status, message? }` e consulta apenas o [endpoint de saúde do serviço](https://supabase.com/docs/guides/troubleshooting/how-do-i-check-gotrueapi-version-of-a-supabase-project-lQAnOR), com limite de 10 segundos. Ela não é chamada automaticamente, não consulta tabelas e não valida políticas RLS nem o banco completo. Não há login ou persistência de sessão.

**Segurança:** `.env` e suas variantes estão ignorados pelo Git; somente `.env.example`, vazio, deve ser versionado. Variáveis `VITE_*` ficam disponíveis no navegador, portanto use apenas a chave pública anônima. Nunca use `service_role`, chaves secretas ou senhas de banco no frontend. Nenhuma credencial foi adicionada ao repositório. As futuras tabelas precisarão de políticas RLS antes de expor dados.


## Componentes da cena

`GameWorld`, `WorldScenery` e `CharacterScene` compõem a paisagem SVG original e reutilizam `PixelAvatar`. `GoalsPanel`, `MissionsPanel` e `CoinsPanel` formam os três painéis; `RewardCard`, `ProgressBar` e `Icon` são reutilizáveis. Os componentes da versão anterior foram preservados, mas não são renderizados pela página atual. Nenhum componente da tela importa o cliente Supabase.

## Interface pixel-art e formulários locais

A página usa contornos marrom-escuros, molduras de madeira em camadas, fundos de pergaminho, ícones SVG pixelados originais e tipografia monoespaçada compacta. `GamePanel` mantém os cabeçalhos e rodapés alinhados; as listas têm rolagem quando crescem. O mundo permanece acima das três colunas no desktop, e os painéis se empilham em telas pequenas. Nuvens e reflexos discretos respeitam a preferência de movimento reduzido.

`AddItemDialog` usa o elemento nativo `dialog`, com foco contido, fechamento por Escape, botão Cancelar e retorno do foco. Metas novas começam em 0%; missões aceitam descrição, XP e moedas; compras aceitam nome e preço em moedas. Campos obrigatórios, limites de texto, números inteiros positivos e validação de espaços em branco evitam entradas inválidas. Tudo usa estado local, sem persistência e sem chamadas ao Supabase.

As ilustrações são SVGs autorais. O PDF fornecido foi consultado como referência de linguagem visual; nenhuma imagem, fonte ou sprite do jogo foi incluído no projeto.
# FarmingHabit
