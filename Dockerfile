# =========================================================
# The Lenny Growth Assistant - Unified Production Dockerfile
# Optimized for Google Cloud Run, Container Registry, and Cloud Build
# =========================================================

# Stage 1: Build React SPA Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend & Static File Server
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, knowledge base index, and built frontend dist
COPY backend/ backend/
COPY data/ data/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Cloud Run automatically sets PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}
