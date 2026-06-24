# store-my-stuff

Book storage space to store bags in a store!

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+

## Getting Started

Install dependencies from the repository root:

```sh
pnpm install
```

## Running All Apps

Start every app in development mode simultaneously:

```sh
pnpm dev
```

## Other Commands

```sh
pnpm build        # Build all apps
pnpm check-types  # Type-check all apps
pnpm lint         # Lint all apps
```

## Project Structure

```
store-my-stuff/
├── apps/
│   ├── booking-web/   # React + Vite frontend
│   └── server/        # Express backend
├── packages/
│   └── typescript-config/  # Shared TypeScript configs
├── turbo.json
└── pnpm-workspace.yaml
```

See each app's README for app-specific details.
