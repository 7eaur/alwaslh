FROM node:22.22.0-bookworm-slim AS build

WORKDIR /app

COPY packages ./packages
COPY apps/student-web/package.json ./apps/student-web/
RUN npm install --no-audit --no-fund --prefix apps/student-web

COPY apps/student-web ./apps/student-web

RUN npm run lint --prefix apps/student-web \
  && npm test --prefix apps/student-web \
  && npm run typecheck --prefix apps/student-web

ARG VITE_API_BASE_URL
ARG VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI=${VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI}

RUN npm run build --prefix apps/student-web --ignore-scripts

FROM nginx:1.27-alpine AS runtime

ENV PORT=8080

COPY --from=build /app/apps/student-web/dist /usr/share/nginx/html

RUN mkdir -p /etc/nginx/templates \
  && printf '%s\n' \
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
