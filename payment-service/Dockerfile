# ── Container 2: HIA Payment Service ─────────────────────────────────────────
# Stripe Payment Intent API — Node.js/Express
# Uses Alpine for minimal image size (~120MB)

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY src/ ./src/

# Non-root user for security
RUN addgroup -S hia && adduser -S hia -G hia
USER hia

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
