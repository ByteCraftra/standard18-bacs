# Stage 1: Build
FROM node:24.11.0-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy package manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/parser/package.json packages/parser/package.json
COPY packages/validator/package.json packages/validator/package.json
COPY packages/analyzer/package.json packages/analyzer/package.json
COPY packages/repair/package.json packages/repair/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy built output and package manifests
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/parser/dist packages/parser/dist
COPY --from=builder /app/packages/parser/package.json packages/parser/package.json
COPY --from=builder /app/packages/validator/dist packages/validator/dist
COPY --from=builder /app/packages/validator/package.json packages/validator/package.json
COPY --from=builder /app/packages/analyzer/dist packages/analyzer/dist
COPY --from=builder /app/packages/analyzer/package.json packages/analyzer/package.json
COPY --from=builder /app/packages/repair/dist packages/repair/dist
COPY --from=builder /app/packages/repair/package.json packages/repair/package.json

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Expose port
EXPOSE 3000

# Start the API (NODE_ENV will be set via environment variable)
CMD ["node", "apps/api/dist/index.js"]