# store-my-stuff Server

Express backend for the store-my-stuff application.

## Setup

From the **repository root**, install all dependencies:

```sh
pnpm install
```

### Environment Variables

The server requires a `.env` file in this directory (`apps/server/.env`). Copy the example file and fill in your own values:

```sh
cp .env.example .env
```

You will need to provide your own MongoDB connection string. You can get one by creating a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) or by running MongoDB locally.

| Variable      | Required | Description                      |
| ------------- | -------- | -------------------------------- |
| `MONGODB_URI` | Yes      | MongoDB connection string        |
| `PORT`        | No       | Server port (defaults to `3001`) |

## Development

Start the dev server with hot-reload:

```sh
# From the repository root
pnpm turbo dev --filter=@store-my-stuff/server

# Or from this directory
pnpm dev
```

The server starts at [http://localhost:3001](http://localhost:3001).

## Seed Scripts

Seed scripts populate your database with test data. Run them from this directory:

```sh
pnpm exec tsx src/scripts/seed-store-data.ts
pnpm exec tsx src/scripts/seed-reservation-rate-data.ts
```

## Available Scripts

| Script             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `pnpm dev`         | Start dev server with hot-reload (via `tsx watch`) |
| `pnpm build`       | Compile TypeScript to `dist/`                      |
| `pnpm start`       | Run the compiled build (`node dist/index.js`)      |
| `pnpm check-types` | Type-check without emitting files                  |
| `pnpm lint`        | Lint source files with ESLint                      |
| `pnpm format`      | Check formatting with Prettier                     |
| `pnpm test`        | Run tests once (Vitest)                            |
| `pnpm test:watch`  | Run tests in watch mode                            |

## Tech Stack

- [Express](https://expressjs.com/) v5
- [Mongoose](https://mongoosejs.com/) (MongoDB)
- [Zod](https://zod.dev/) for request validation
- [Vitest](https://vitest.dev/) for testing
- [TypeScript](https://www.typescriptlang.org/)
- [tsx](https://tsx.is/) for development
