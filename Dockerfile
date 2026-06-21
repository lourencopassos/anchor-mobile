# =============================================================================
# Anchor Web (PWA) — Expo web export served as a static SPA
# =============================================================================
# EXPO_PUBLIC_API_URL is inlined at BUILD time by `expo export`, so it must be
# present during the build. On Railway, set it as a service variable; declare it
# as an ARG here so Railway's build injects it.
# =============================================================================

# ---- Build the static web bundle -------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npx expo export -p web

# ---- Serve as a static SPA -------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm i -g serve@14
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
# -s serves index.html for unknown routes (SPA deep-link fallback)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
