FROM node:26-alpine3.22 AS frontend-builder
WORKDIR /build
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm run build

FROM python:3.14-slim-trixie
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock .
RUN uv sync --locked --no-install-project --no-dev
COPY backend/ .
RUN uv sync --locked --no-dev

COPY --from=frontend-builder /build/dist ./dist

EXPOSE 8000
ENV ENVIRONMENT=prod
ENV PATH="/app/.venv/bin:$PATH"
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
