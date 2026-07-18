# Portfolio Monorepo

A full-stack portfolio website with an admin panel, built as a pnpm monorepo.

## Project structure

```
frontend/
  portfolio/   Public-facing portfolio site (React + Vite + Tailwind)
  admin/       Admin panel — JWT-protected (React + Vite + Tailwind)
backend/
  api-server/  Express.js REST API
lib/
  db/          Drizzle ORM database layer (PostgreSQL)
  api-spec/    OpenAPI spec (openapi.yaml) — source of truth for the API contract
  api-zod/     Zod schemas generated from the OpenAPI spec
  api-client-react/  React Query hooks generated from the OpenAPI spec
docker-compose.yml   Orchestrates all three services
run.sh               Convenience wrapper around docker compose up --build
```

## Running with Docker Compose

```bash
chmod +x run.sh
./run.sh                # build images and start everything
./run.sh --no-build     # skip rebuild, use cached images
./run.sh portfolio      # start a single service
```

Services exposed:
| Service   | Port | URL                    |
|-----------|------|------------------------|
| portfolio | 5173 | http://localhost:5173  |
| admin     | 5174 | http://localhost:5174  |
| backend   | 3000 | http://localhost:3000  |

## Running without Docker (pnpm workspace)

```bash
pnpm install

# Each in a separate terminal:
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/portfolio run dev
PORT=5174 BASE_PATH=/admin/ pnpm --filter @workspace/admin run dev
PORT=3000 pnpm --filter @workspace/api-server run dev
```

## Environment variables

Create a `.env` file at the project root (loaded by docker-compose automatically):

| Variable       | Required | Description                         |
|----------------|----------|-------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string        |
| `SESSION_SECRET` | Yes    | Secret for JWT signing              |

## Database

Uses Drizzle ORM with PostgreSQL. Schema in `lib/db/src/schema/`.

```bash
pnpm --filter @workspace/db run push      # push schema to DB
pnpm --filter @workspace/db run migrate   # run migrations
```

## API spec → code generation

Edit `lib/api-spec/openapi.yaml`, then regenerate:

```bash
pnpm --filter @workspace/api-spec run generate
```

This updates Zod schemas in `lib/api-zod/src/` and React Query hooks in `lib/api-client-react/src/`.

## Design

- **Theme:** Dark, near-black background (`#0A0A0B`) with muted amber accent. Admin panel matches this palette.
- **Typography:** Inter (sans) + JetBrains Mono.
- **Corners:** Sharp (0.25 rem radius).

## User preferences

_No preferences recorded yet._
