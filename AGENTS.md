# Repository Guidelines

## Project Structure & Module Organization

Kitab is a two-part reader application. `frontend/` contains the SolidJS/Vite client: application shell code is in `src/app/`, shared browser utilities in `src/core/`, state stores in `src/stores/`, and feature code in `src/features/` (notably `library/` and `viewers/`). Keep a feature's components, API helpers, primitives, and CSS modules close together. Static browser assets belong in `frontend/public/`.

`backend/app/` is the FastAPI service. Routes live in `routes/`, request and response models in `schemas/`, database entities in `models/`, domain operations in `services/`, and configuration/database setup in `core/` and `db/`. The backend serves the built frontend from `backend/dist/`; do not commit generated `dist/` directories.

## Build, Test, and Development Commands

Run frontend commands from `frontend/`:

- `pnpm install` installs locked JavaScript dependencies.
- `pnpm dev` starts the Vite development server.
- `pnpm build` type-checks/builds the production client.
- `pnpm test` runs Vitest in watch mode; use `pnpm vitest run` for a one-shot run.
- `pnpm exec dprint fmt` formats TypeScript, TSX, and styles according to `dprint.json`.

Run backend commands from `backend/`:

- `uv sync` creates/updates the Python 3.14 environment from `pyproject.toml` and `uv.lock`.
- `uv run fastapi dev app/main.py` starts the API in development mode.

`docker build .` produces the full production image, including the frontend build.

## Coding Style & Naming Conventions

Use TypeScript with tabs, semicolons, double quotes, and a 120-column limit (90 for TSX), enforced by dprint. Name Solid components in `PascalCase` (`PDFViewer.tsx`); use `camelCase` for functions, stores, and helpers; and pair component styles as `Name.module.css`.

Use Python's conventional four-space indentation, `snake_case` modules/functions, `PascalCase` classes, and explicit Pydantic schema types. Preserve the route → service → model/schema separation.

## Testing Guidelines

Vitest is configured for the frontend. Add focused `*.test.ts` or `*.test.tsx` files beside the unit or under the relevant feature. Cover changed behavior and run the one-shot test command before submitting. No backend test suite is currently configured; add FastAPI tests under `backend/tests/` when changing server behavior.

## Commit & Pull Request Guidelines

Follow the existing Conventional Commit style: `feat:`, `fix:`, `refactor:`, or `chore:` followed by a concise imperative summary (emojis are common but optional). Keep commits scoped. PRs should explain the user-visible change, link relevant issues, state validation performed, and include screenshots or recordings for UI changes. Note any new environment variables or migration implications.
