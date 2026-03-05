FROM oven/bun:1 AS builder
WORKDIR /app

COPY bun.lock bunfig.toml package.json ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY src ./src
COPY config.yml ./config.yml

RUN bun build src/bootstrap.ts --outdir dist --target bun

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config.yml ./config.yml

CMD ["bun", "dist/bootstrap.js"]
