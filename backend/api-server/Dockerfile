FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo manifests
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy shared libraries and the backend
COPY lib/ ./lib/
COPY backend/ ./backend/

RUN pnpm install

WORKDIR /app/backend/api-server

ENV PORT=3000
ENV NODE_ENV=development

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
