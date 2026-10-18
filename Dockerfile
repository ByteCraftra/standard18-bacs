# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install pnpm directly. Do not use corepack here — it enforces the
# packageManager field and will fail if that pinned version/hash
# cannot be fetched, which is what was breaking the build.
RUN npm install -g pnpm@12.14.0

WORKDIR /app

# Copy manifests first (layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/parser/package.json packages/parser/package.json
COPY packages/validator/package.json packages/validator/package.json
COPY packages/analyzer/package.json packages/analyzer/package.json
COPY packages/repair/package.json packages/repair/package.json

# Full install (dev + prod) for building
RUN pnpm install --frozen-lockfile

# Copy source and build everything
COPY . .
RUN pnpm build

# ─────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────
FROM node:22-alpine

RUN npm install -g pnpm@12.14.0

WORKDIR /app

# Manifests
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/parser/package.json packages/parser/package.json
COPY --from=builder /app/packages/validator/package.json packages/validator/package.json
COPY --from=builder /app/packages/analyzer/package.json packages/analyzer/package.json
COPY --from=builder /app/packages/repair/package.json packages/repair/package.json

# Built output
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/parser/dist packages/parser/dist
COPY --from=builder /app/packages/validator/dist packages/validator/dist
COPY --from=builder /app/packages/analyzer/dist packages/analyzer/dist
COPY --from=builder /app/packages/repair/dist packages/repair/dist

# Production dependencies only — --ignore-scripts skips husky
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]