FROM node:26-alpine3.22 AS frontend-builder
WORKDIR /build
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.14-slim-trixie
WORKDIR /src
COPY backend/pyproject.toml .
RUN pip install .
COPY backend/ .
COPY --from=frontend-builder /build/dist ./dist
EXPOSE 8000
ENV ENVIRONMENT=prod
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
