# Taiyin, el agente de la página (docs/taiyin.md). En Coolify: Build Pack «Dockerfile», base
# directory /taiyin, puerto 8787, dominio taiyin.howenh-labs.com, variables ANTHROPIC_API_KEY,
# TAIYIN_ORIGENES (opcional) y TAIYIN_APAGADO=1 para apagarlo.
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs reglas.mjs instrucciones.md conocimiento.md ./
USER node
EXPOSE 8787
CMD ["node", "server.mjs"]
