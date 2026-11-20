
# Etapa 1: obtener Node.js y npm
FROM node:22-bookworm-slim AS node-runtime

# Etapa 2: imagen principal con Python 3.12
FROM python:3.12-slim

# Copiar Node.js y npm desde la primera etapa
COPY --from=node-runtime /usr/local/ /usr/local/

# Dependencias necesarias para OpenCV, MediaPipe y FFmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libegl1 \
    libgles2 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Entorno virtual Python
RUN python -m venv /opt/biometra-venv

ENV PATH="/opt/biometra-venv/bin:$PATH"

# Instalar dependencias del análisis
COPY analisis/requirements.txt /tmp/requirements.txt

RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Preparar backend
WORKDIR /app/Backend

COPY Backend/package*.json ./

RUN npm install

COPY Backend/ ./

# Copiar módulo de análisis
COPY analisis/ /app/analisis/

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
