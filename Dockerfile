# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked in only as a fallback for environments that skip the runtime
# config.js step entirely; prefer API_URL at container/deploy time (see
# docker/40-inject-runtime-config.sh and README.md).
ARG VITE_API_URL=http://127.0.0.1:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- runtime ----
# nginx-unprivileged: listens on 8080 and runs as a non-root user out of the
# box, which is what EKS PodSecurity baselines expect. Same static `dist/`
# output also works unmodified on S3 + CloudFront.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/config.js.template /usr/share/nginx/html/config.js.template
COPY docker/40-inject-runtime-config.sh /docker-entrypoint.d/40-inject-runtime-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

USER root
RUN chmod +x /docker-entrypoint.d/40-inject-runtime-config.sh \
    && chown -R nginx:nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
