# store-my-stuff Website

React frontend for the store-my-stuff application, built with Vite.

## Setup

From the **repository root**, install all dependencies:

```sh
pnpm install
```

## Development

Start the Vite dev server:

```sh
# From the repository root
pnpm turbo dev --filter=@store-my-stuff/booking-web

# Or from this directory
pnpm dev
```

The app starts at [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Script             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Start Vite dev server with HMR                          |
| `pnpm build`       | Type-check and build for production (output in `dist/`) |
| `pnpm preview`     | Preview the production build locally                    |
| `pnpm check-types` | Type-check without building                             |

## Tech Stack

- [React](https://react.dev/) v19
- [Vite](https://vite.dev/) v6
- [TypeScript](https://www.typescriptlang.org/)
