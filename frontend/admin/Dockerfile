FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo manifests
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy shared libraries and frontend apps
COPY lib/ ./lib/
COPY frontend/ ./frontend/

RUN pnpm install

WORKDIR /app/frontend/admin

ENV PORT=5174
ENV BASE_PATH=/admin/

EXPOSE 5174

CMD ["pnpm", "run", "dev"]
