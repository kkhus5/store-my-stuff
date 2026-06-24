# store-my-stuff Server

Express backend for the store-my-stuff application.

## Setup

From the **repository root**, install all dependencies:

```sh
pnpm install
```

## Development

Start the dev server with hot-reload:

```sh
# From the repository root
pnpm turbo dev --filter=@store-my-stuff/server

# Or from this directory
pnpm dev
```

The server starts at [http://localhost:3001](http://localhost:3001).

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with hot-reload (via `tsx watch`) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled build (`node dist/index.js`) |
| `pnpm check-types` | Type-check without emitting files |

## Tech Stack

- [Express](https://expressjs.com/) v5
- [TypeScript](https://www.typescriptlang.org/)
- [tsx](https://tsx.is/) for development
