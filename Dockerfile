FROM node:20-alpine as builder
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем все исходники (включая prisma/schema.prisma)
COPY . .

# Генерируем Prisma Client в ./generated
RUN npx prisma generate

# Сборка Nuxt
RUN npm run build

# Финальный образ
FROM node:20-alpine
WORKDIR /app

# Копируем собранное приложение
COPY --from=builder /app/.output ./.output

# Копируем node_modules (нужны для работы Prisma и адаптера)
COPY --from=builder /app/node_modules ./node_modules

# Копируем сгенерированный клиент (папка ./generated)
COPY --from=builder /app/generated ./generated

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]