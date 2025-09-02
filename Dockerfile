FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm i
COPY . .
RUN npm run build
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm i -g serve
EXPOSE 8080
CMD ["serve","-s","dist","-l","8080"]