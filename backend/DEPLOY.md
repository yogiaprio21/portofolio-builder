# Backend deploy notes

Target: Render Web Service + Neon Postgres.

## Render

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/healthz`

Required environment variables:

- `NODE_ENV=production`
- `DATABASE_URL=<Neon connection string>`
- `JWT_SECRET=<long random secret>`
- `CORS_ORIGIN=https://<your-vercel-domain>`
- `PG_SSL=true`
- `TRUST_PROXY=1`
- `REQUIRE_UPLOAD_AUTH=true`
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAMESITE=None` if frontend and backend use different domains
- `REFRESH_TOKEN_DAYS=30`
- `APP_URL=https://<your-vercel-domain>`

Optional environment variables:

- `UPLOAD_MAX_BYTES=5242880`
- `JSON_BODY_LIMIT=1mb`
- `RATE_LIMIT_MAX=600`
- `AUTH_RATE_LIMIT_MAX=20`
- `UPLOAD_RATE_LIMIT_MAX=30`
- `AI_RATE_LIMIT_MAX=60`
- `LOG_LEVEL=info`

## Neon

Use a Neon pooled connection string when connection concurrency grows. Keep the value in `DATABASE_URL`; do not commit it.

## Upload storage: Cloudinary recommended

Cloudinary is the recommended default for this project because portfolio images are web-facing media assets and Render's free filesystem is ephemeral. Configure:

- `STORAGE_PROVIDER=cloudinary`
- `CLOUDINARY_CLOUD_NAME=<cloud name>`
- `CLOUDINARY_API_KEY=<api key>`
- `CLOUDINARY_API_SECRET=<api secret>`
- `CLOUDINARY_FOLDER=portfolio-builder`

The backend performs signed uploads to Cloudinary, so no Cloudinary secret is exposed to the frontend.

If you keep local uploads on Render, attach a persistent disk and set `UPLOAD_DIR` to a path under that disk mount. Free Render services cannot persist local uploads across deploys/restarts.

## Email verification

Local development uses `EMAIL_PROVIDER=log`, which logs verification links. For production, configure Resend:

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=<resend api key>`
- `EMAIL_FROM=Portfolio Builder <verify@your-domain.com>`

## Important follow-up

Schema changes now run through `src/db/migrations`. Add future schema updates as new numbered migration files and run `npm run migrate` during deploy/pre-deploy when needed.

## Auth sessions

Login returns the legacy JSON access token and also sets HttpOnly access/refresh cookies. `/auth/refresh` rotates refresh tokens through the `sessions` table, and `/auth/logout` revokes the active refresh token when present.

## Asset lifecycle

Image uploads are recorded in `upload_assets`. If a portfolio item points to a tracked Cloudinary asset, deleting or replacing the item attempts to delete the Cloudinary asset as well.
