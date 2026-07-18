FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo manifests
COPY package.json pnpm-workspace.yaml ./
# Copy lockfile — may be regenerated if workspace paths changed
COPY pnpm-lock.yaml* ./

# Copy shared libraries and frontend apps
COPY lib/ ./lib/
COPY frontend/ ./frontend/

# Install all workspace deps (no frozen-lockfile to handle path changes)
RUN pnpm install

WORKDIR /app/frontend/portfolio

ENV PORT=5173
ENV BASE_PATH=/

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
