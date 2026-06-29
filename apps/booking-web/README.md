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

In development, Vite proxies all `/api` requests to the server at `http://localhost:3001`, so you'll need the server running for API calls to work. The easiest way is to run `pnpm dev` from the repository root, which starts both apps together.

## Available Scripts

| Script             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Start Vite dev server with HMR                          |
| `pnpm build`       | Type-check and build for production (output in `dist/`) |
| `pnpm preview`     | Preview the production build locally                    |
| `pnpm check-types` | Type-check without building                             |
| `pnpm lint`        | Lint source files with ESLint                           |
| `pnpm format`      | Check formatting with Prettier                          |

## Tech Stack

- [React](https://react.dev/) v19
- [Vite](https://vite.dev/) v6
- [React Router](https://reactrouter.com/) v7
- [TanStack React Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [TypeScript](https://www.typescriptlang.org/)
