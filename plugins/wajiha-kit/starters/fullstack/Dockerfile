# syntax=docker/dockerfile:1
# Production image: build stage, then a small runtime with only the built server (.output).
# Build:  docker build --build-arg VITE_SITE_URL=https://example.com --build-arg VITE_ALLOW_INDEXING=true -t my-project .
# Run:    docker run --rm -p 3000:3000 -e CONTACT_WEBHOOK_URL=https://hooks.example.com/contact my-project
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
# The admin's API (a path on this site or an absolute URL) and its mock switch; the mock is off in images.
ARG VITE_ADMIN_API_URL=/api
ARG VITE_ADMIN_API_MOCK=false
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_ALLOW_INDEXING=$VITE_ALLOW_INDEXING \
    VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL \
    VITE_ADMIN_API_MOCK=$VITE_ADMIN_API_MOCK \
    NODE_ENV=production
COPY . .
# The build makes no source map, and check-no-maps fails the image build if one ever appears in .output (a map
# holds the original source and .output/public is served).
# A build with the mock off ships no mock service worker. The Vite config already drops it; the last line is
# the second lock, so an image can never carry it (the file is inert without a page that registers it).
RUN npm run build \
    && node scripts/check-no-maps.mjs \
    && if [ "$VITE_ADMIN_API_MOCK" != "true" ]; then rm -f .output/public/mockServiceWorker.js*; fi

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
