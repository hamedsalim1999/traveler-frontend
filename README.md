# traveler-frontend

React (Vite + TypeScript + Tailwind CSS) frontend for a leader-led trip
marketplace, talking to [traveler-backend](../traveler-backend)'s API —
see `http://127.0.0.1:8080/swagger/index.html` for the full spec. Visual
design and product structure are modeled on a Lovable prototype
(trip-trail-connect): a violet-to-blue gradient hero, real accounts,
published day-by-day itineraries, and a 5%-commission price breakdown.

## Pages

| Route                | Description                                                        |
| ---------------------- | ---------------------------------------------------------------------- |
| `/`                   | Marketing landing page — hero, how it works, featured trips          |
| `/browse`             | Search/filter trips by destination, dates, budget                    |
| `/trips/new`          | Publish a trip (signed-in leader/both only)                          |
| `/trips/:id`          | Trip detail — itinerary, reviews, price breakdown, join/leave        |
| `/profiles/:id`       | Profile detail — bio, rating, trips led, edit/delete (own profile)   |
| `/become-a-leader`    | Pitch page for leading a trip                                       |
| `/auth`               | Login / signup (`?mode=signup`, `?next=`, `?type=leader`)            |

Auth is real but intentionally minimal: email/password against the
backend's bearer-token sessions (`src/lib/auth.tsx`, `src/lib/token.ts`),
persisted to `localStorage`. There's no Google OAuth (the button is a
disabled "coming soon" stub, matching the reference site) and no email
verification or password reset.

## Local development

Requires the backend running (see traveler-backend's README) and Node 20+.

```bash
npm install
cp .env.example .env.local   # VITE_API_URL, defaults to http://127.0.0.1:8080
npm run dev                  # http://localhost:5173
```

The backend must allow this origin in its `ALLOWED_ORIGINS` — the default
already includes `http://localhost:5173`.

## Runtime-configurable API URL

The build output doesn't hardcode the API URL. `index.html` loads
`/config.js` before the app bundle; `src/lib/config.ts` reads
`window.__APP_CONFIG__.API_URL` from it, falling back to the build-time
`VITE_API_URL` (used by `npm run dev`/`vite preview`) and finally to
`http://127.0.0.1:8080`.

This means **one build artifact works for every environment**:

- **Docker/EKS**: `docker/40-inject-runtime-config.sh` runs on container
  start (via nginx's standard `/docker-entrypoint.d/` hook) and renders
  `config.js` from the `API_URL` env var.
- **S3/CloudFront**: run `npm run build`, upload `dist/`, then have your
  deploy pipeline overwrite `dist/config.js` with that environment's API
  URL — no rebuild needed to point the same bundle at a different backend.

## Docker

```bash
cp .env.example .env   # API_URL, WEB_PORT
docker compose up --build   # http://localhost:${WEB_PORT:-3000}
```

`Dockerfile` is a multi-stage build: `node:22-alpine` runs `npm run build`,
then the static `dist/` output is served by
[`nginxinc/nginx-unprivileged`](https://github.com/nginxinc/docker-nginx-unprivileged)
— listens on port 8080 and runs as a non-root user out of the box, which is
what EKS PodSecurity baselines expect. `docker/nginx.conf` adds SPA
fallback routing, gzip, long-lived caching for fingerprinted assets, and a
`/healthz` endpoint for liveness/readiness probes.

The same `dist/` build this Dockerfile produces is also what you'd upload
to S3 for a CloudFront distribution — nothing about the app is
container-specific, so both hosting paths stay compatible from one build.

## Configuration

| Variable         | Where used                        | Default                    | Purpose                                              |
| ------------------ | ------------------------------------ | ----------------------------- | ------------------------------------------------------- |
| `VITE_API_URL`    | `npm run dev` / `vite preview`      | `http://127.0.0.1:8080`     | Build-time fallback API URL                            |
| `API_URL`         | `docker compose up`                 | `http://127.0.0.1:8080`     | Runtime API URL, injected into `config.js` on container start |
| `WEB_PORT`        | `docker compose up`                 | `3000`                       | Host port the container is published on                |

## Production

```bash
docker build -t <account>.dkr.ecr.<region>.amazonaws.com/traveler-frontend:<tag> .
docker push <account>.dkr.ecr.<region>.amazonaws.com/traveler-frontend:<tag>
```

Deploy to EKS with `API_URL` set to the backend's URL in the pod's
environment (e.g. via a ConfigMap); the container renders `config.js` from
it on start, so the same image promotes across environments unchanged.

For CloudFront, upload `npm run build`'s `dist/` to S3, point the
distribution at the bucket with an SPA-friendly error response (404/403 →
`/index.html`, HTTP 200 — CloudFront's equivalent of nginx's `try_files`
fallback here), and have your deploy step write the environment's API URL
into `dist/config.js` before/while uploading.

Either way, make sure the backend's `ALLOWED_ORIGINS` includes this app's
deployed origin.

## Layout

```
docker/
  nginx.conf                       SPA routing, gzip, caching, /healthz
  config.js.template               envsubst'd into config.js on container start
  40-inject-runtime-config.sh      renders config.js from $API_URL
public/
  config.js                        dev/build-time placeholder for runtime config
src/
  lib/
    config.ts                      resolves the API base URL (runtime > build-time)
    api.ts                         typed fetch wrapper, attaches the bearer token
    auth.tsx                       AuthProvider/useAuth — signup/login/logout state
    token.ts                       session token storage (localStorage + in-memory)
    types.ts                       API request/response types (mirrors swagger.json)
  features/
    trips/ profiles/ tripdays/ follows/ reviews/
      api.ts                       React Query hooks per resource
  components/
    Layout.tsx                     nav (auth-aware) + footer + page shell
    Hero.tsx                       gradient hero, "how it works", CTA sections
    TripCard.tsx, TripPhoto.tsx, DifficultyBadge.tsx, StarRating.tsx
    ui/                             Button, Card, Field, Tabs, Accordion, Skeleton…
  pages/                           one file per route
Dockerfile                         multi-stage build: node -> nginx-unprivileged
docker-compose.yml                 local container run
```
