# zaplink

A link-in-bio style profile app: a public profile page per username, with a
private dashboard for arranging links, analytics and settings.

## Features

- **TypeScript 7** - the native compiler, for type safety and editor tooling
- **Next.js** - App Router, React Server Components
- **tRPC** - end-to-end type-safe API, mounted inside Next at `/api/trpc`
- **Tailwind CSS** - utility-first CSS
- **shadcn/ui on Base UI** - unstyled, accessible component primitives
- **Bun** - runtime and package manager
- **Turborepo** - monorepo build system
- **Drizzle ORM** - TypeScript-first ORM
- **Neon** - serverless PostgreSQL
- **Better Auth** - authentication
- **Biome** - linting and formatting
- **Husky + lint-staged** - pre-commit formatting

## Getting Started

Install dependencies:

```bash
bun install
```

Configure the environment. The web app reads `apps/web/.env`, which
`packages/db` also loads for its own connection:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

Apply the schema to your database:

```bash
bun run db:push
```

Then start the dev server:

```bash
bun run dev
```

The app is served at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
zaplink/
├── apps/
│   └── web/           # Next.js app: UI, route handlers, tRPC endpoint
└── packages/
    ├── api/           # tRPC routers, procedures and context
    ├── auth/          # Better Auth configuration
    └── db/            # Drizzle schema, migrations and client
```

`tRPC` has no separate server. The routers in `packages/api` are served by a
route handler at `apps/web/src/app/api/trpc/[trpc]/route.ts`, so there is one
process and one port.

## Available Scripts

- `bun run dev`: Start all apps in development mode
- `bun run dev:web`: Start only the web app
- `bun run build`: Build all apps
- `bun run check-types`: Type-check every workspace
- `bun run check`: Lint and format with Biome
- `bun run db:push`: Push the Drizzle schema to the database
- `bun run db:generate`: Generate a migration from schema changes
- `bun run db:migrate`: Apply generated migrations
- `bun run db:studio`: Open Drizzle Studio
