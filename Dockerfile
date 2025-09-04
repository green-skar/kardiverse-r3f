# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm i
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps || npm i --omit=dev

# Copy built React app
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Run Express instead of "serve"
CMD ["node", "dist/server.js"]
