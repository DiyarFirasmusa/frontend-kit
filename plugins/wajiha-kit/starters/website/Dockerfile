# syntax=docker/dockerfile:1
# Production image: build stage, then a small runtime with only the built server (.output).
# Build:  docker build --build-arg VITE_SITE_URL=https://example.com --build-arg VITE_ALLOW_INDEXING=true -t website .
# Run:    docker run --rm -p 3000:3000 -e CONTACT_WEBHOOK_URL=https://hooks.example.com/contact website
#
# VITE_* values are baked into the browser bundle at build time, so they are build arguments, not run-time
# variables. Server-only values (CSP_MODE, CONTACT_WEBHOOK_URL) are read when the container starts, and a
# bad value stops it with one clear line. With VITE_ALLOW_INDEXING=true (the real site) the container
# refuses to start without CONTACT_WEBHOOK_URL, so contact messages are never silently dropped.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# --ignore-scripts: no git hooks in an image (the "prepare" script is for developers).
RUN npm ci --ignore-scripts

FROM deps AS build
ARG VITE_SITE_URL
ARG VITE_ALLOW_INDEXING=false
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_ALLOW_INDEXING=$VITE_ALLOW_INDEXING \
    NODE_ENV=production
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
# The Nitro output is self-contained: bundled server code plus the few packages it needs.
COPY --from=build --chown=node:node /app/.output ./.output
# Never run as root.
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
