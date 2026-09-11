FROM node:22.22.0-bookworm-slim AS build

WORKDIR /app

COPY packages ./packages
COPY apps/admin-web/package.json ./apps/admin-web/
RUN npm install --no-audit --no-fund --prefix apps/admin-web

COPY apps/admin-web ./apps/admin-web

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build --prefix apps/admin-web

FROM nginx:1.27-alpine AS runtime

ENV PORT=8080

COPY --from=build /app/apps/admin-web/dist /usr/share/nginx/html

RUN printf '%s\n' \
  'server {' \
  '  listen ${PORT};' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '}' \
  > /etc/nginx/templates/default.conf.template

EXPOSE 8080
