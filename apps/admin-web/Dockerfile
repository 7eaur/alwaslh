FROM node:22.22.0-bookworm-slim AS build

WORKDIR /app

COPY packages ./packages
COPY apps/admin-web/package.json ./apps/admin-web/
RUN npm install --no-audit --no-fund --prefix apps/admin-web

COPY apps/admin-web ./apps/admin-web

# Production traffic is intentionally same-origin. Local/dev builds may still
# provide VITE_API_BASE_URL outside this production Docker image.
ENV VITE_API_BASE_URL=""
RUN npm run build --prefix apps/admin-web

FROM nginx:1.27-alpine AS runtime

ENV PORT=8080

COPY --from=build /app/apps/admin-web/dist /usr/share/nginx/html

RUN mkdir -p /etc/nginx/templates \
  && printf '%s\n' \
  'server {' \
  '  listen ${PORT};' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location /v1/ {' \
  '    proxy_pass ${API_UPSTREAM};' \
  '    proxy_http_version 1.1;' \
  '    proxy_ssl_server_name on;' \
  '    proxy_set_header Host $proxy_host;' \
  '    proxy_set_header X-Forwarded-Host $host;' \
  '    proxy_set_header X-Forwarded-Proto $scheme;' \
  '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '  }' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '}' \
  > /etc/nginx/templates/default.conf.template

EXPOSE 8080