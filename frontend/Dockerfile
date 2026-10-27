# --- Estágio 1: build da aplicação React ---
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Inclui o frontend/.env: as variáveis VITE_* são lidas aqui, no build (não ao rodar o container)
COPY . .
RUN npm run build

# --- Estágio 2: servir com Nginx ---
# A navegação é por hash (#metas, #loja), então não precisa de regra extra de rotas no Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
