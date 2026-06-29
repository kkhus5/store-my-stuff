# store-my-stuff

Book storage space to store bags in a store!

## Prerequisites

- [Node.js](https://nodejs.org/) v22+ (see `.nvmrc`)
- [pnpm](https://pnpm.io/) v10+

## Getting Started

Install dependencies from the repository root:

```sh
pnpm install
```

Before running the server, you'll need to set up its environment variables. See the [server README](apps/server/README.md) for details.

## Running All Apps

Start every app in development mode simultaneously:

```sh
pnpm dev
```

This starts the Express server on [http://localhost:3001](http://localhost:3001) and the Vite frontend on [http://localhost:5173](http://localhost:5173). The frontend proxies `/api` requests to the server automatically.

## Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `pnpm dev`            | Start all apps in development mode       |
| `pnpm build`          | Build all apps                           |
| `pnpm check-types`    | Type-check all apps                      |
| `pnpm lint`           | Lint all apps                            |
| `pnpm format`         | Check formatting across the monorepo     |
| `pnpm test`           | Run tests across all apps                |
| `pnpm check:circular` | Check for circular dependencies (server) |

## Project Structure

```
store-my-stuff/
├── apps/
│   ├── booking-web/   # React + Vite frontend
│   └── server/        # Express + MongoDB backend
├── packages/
│   └── typescript-config/  # Shared TypeScript configs
├── turbo.json
└── pnpm-workspace.yaml
```

See each app's README for app-specific details.
