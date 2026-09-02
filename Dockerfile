FROM node:26-alpine3.22 AS frontend-builder
WORKDIR /build
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm run build

FROM python:3.14-slim-trixie
WORKDIR /src
COPY backend/pyproject.toml .
RUN pip install .
COPY backend/ .
COPY --from=frontend-builder /build/dist ./dist
EXPOSE 8000
ENV ENVIRONMENT=prod
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
