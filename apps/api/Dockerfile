FROM node:22.22.0-bookworm-slim AS build

WORKDIR /app

COPY apps/api/package.json ./apps/api/
RUN npm install --no-audit --no-fund --prefix apps/api

COPY apps/api ./apps/api
RUN npm run build --prefix apps/api

FROM node:22.22.0-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates gosu poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/package.json ./apps/api/
RUN npm install --omit=dev --no-audit --no-fund --prefix apps/api

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY database/migrations ./database/migrations
COPY apps/api/docker-entrypoint.sh /usr/local/bin/alwaslh-api-entrypoint

RUN chmod 0755 /usr/local/bin/alwaslh-api-entrypoint \
    && mkdir -p /app/runtime-data/media \
    && chown -R node:node /app

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/alwaslh-api-entrypoint"]
CMD ["node", "apps/api/dist/server.js"]
