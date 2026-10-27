# FarmingHabit — Frontend

Interface do FarmingHabit em React 19, TypeScript, Vite e Tailwind CSS v4. Visão geral do projeto e como rodar tudo está no [README da raiz](../README.md).

## Scripts

```bash
npm run dev        # servidor de desenvolvimento (Vite)
npm run typecheck  # tsc --noEmit
npm run build      # checagem de tipos + build de produção em dist/
npm run preview    # serve o dist/ localmente
```

Não há testes automatizados nem linter configurado no frontend; a checagem de tipos é a verificação padrão.

## Variáveis de ambiente

Crie `frontend/.env` com as variáveis abaixo (só são lidas no `npm run dev`/`build`, então reinicie o Vite ao alterá-las). Todas as variáveis `VITE_*` vão para o navegador, então nunca coloque segredos aqui.

| Variável | Uso |
| --- | --- |
| `VITE_API_URL` | Endereço do backend (padrão `http://localhost:3000`) |
| `VITE_USER_ID` | Opcional: fixa o jogador. Sem ela, usa o usuário mais recente do banco |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Cliente Supabase em `src/lib/supabase.ts`. Hoje não é usado pelas telas |

## Organização

```text
src/
  pages/        Uma página por aba (início, metas, missões, diário, evolução, loja, configurações)
  components/   Componentes por funcionalidade; dialogs/ tem o modal padrão (GameDialog)
  hooks/        Estado de cada funcionalidade (use*.ts)
  lib/          Regras de jogo e leitura/gravação no localStorage
  services/     Chamadas HTTP ao backend (api.ts)
  styles/       Um CSS por página; tokens de cor em global.css (@theme)
  types/        Tipos compartilhados
```

- **Navegação:** por hash da URL (`#metas`, `#loja`...), sem biblioteca de rotas.
- **Dados:** missões, recompensas e compras vêm do backend. Metas, diário e preferências ficam no `localStorage` (chaves `farminghabit.*`) e são sincronizados com o servidor por `src/lib/cloudSync.ts`.
- **Ilustrações:** SVG e pixel art feitos à mão, em componentes TSX. Não há arquivos de imagem de terceiros.

As diretrizes de design e de UX usadas neste projeto estão no [CLAUDE.md](../CLAUDE.md).
