# --- Estágio 1: instala tudo, gera o cliente Prisma e compila o NestJS ---
FROM node:24-alpine AS builder
# A Prisma precisa do OpenSSL, que não vem na imagem Alpine
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
# Gera o cliente, compila para dist/ e tira as dependências de desenvolvimento (o cliente gerado fica)
RUN npx prisma generate && npm run build && npm prune --omit=dev

# --- Estágio 2: só o necessário para rodar a API ---
FROM node:24-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Roda sem privilégios de root
USER node
EXPOSE 3000

# As migrações não rodam aqui: use "docker compose run --rm migrate" quando quiser aplicá-las
CMD ["node", "dist/src/main.js"]
