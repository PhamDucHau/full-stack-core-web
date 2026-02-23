# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Tránh yarn dùng /tmp (dễ gây EIO trong Docker), dùng thư mục trong /app
ENV TMPDIR=/app/.tmp
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
RUN mkdir -p .tmp .yarn-cache

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci; fi

COPY . .

# Build NestJS
RUN yarn build || npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV TMPDIR=/app/.tmp
ENV YARN_CACHE_FOLDER=/app/.yarn-cache
RUN mkdir -p .tmp .yarn-cache

# Copy package files and install production deps only
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; else npm ci --omit=dev; fi

# Copy built output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
