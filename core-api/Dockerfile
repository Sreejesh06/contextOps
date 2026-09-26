FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source files
COPY tsconfig.json ./
COPY src ./src/

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["npx", "tsx", "src/server.ts"]
