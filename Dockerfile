FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Генерируем Prisma Client (важно!)
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# Копируем собранное приложение
COPY --from=builder /app/.output ./.output
# Копируем все зависимости (включая @prisma/client)
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]