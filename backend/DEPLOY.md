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
- `SEED_ON_START=true`
- `SEED_UPDATE_EXISTING_TEMPLATES=true`

Optional environment variables:

- `UPLOAD_MAX_BYTES=5242880`
- `JSON_BODY_LIMIT=1mb`
- `RATE_LIMIT_MAX=600`
- `AUTH_RATE_LIMIT_MAX=20`
- `UPLOAD_RATE_LIMIT_MAX=30`
- `AI_RATE_LIMIT_MAX=60`
- `LOG_LEVEL=info`
- `AI_PROVIDER=heuristic`
- `OPENAI_API_KEY=<key>` only if `AI_PROVIDER=openai`
- `OPENAI_MODEL=gpt-4o-mini`

## Neon

Use a Neon pooled connection string when connection concurrency grows. Keep the value in `DATABASE_URL`; do not commit it.

Run migrations and complete seed data manually when needed:

```bash
npm run db:setup
```

This command is idempotent: it applies pending migrations, refreshes built-in templates, optionally creates an admin account, and optionally creates a demo portfolio.

Optional seed variables:

- `SEED_ADMIN_EMAIL=<admin email>`
- `SEED_ADMIN_PASSWORD=<strong password>`
- `SEED_DEMO_PORTFOLIO=true`
- `SEED_DEMO_EMAIL=<demo email>`
- `SEED_DEMO_PASSWORD=<strong password>`

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

### Gmail SMTP alternative

Gmail SMTP is supported through `EMAIL_PROVIDER=smtp`. This is useful for testing or small early deployments, but transactional providers such as Resend/Brevo are still better for production deliverability.

For Gmail:

- Enable 2-Step Verification on the Google account.
- Create a Google App Password.
- Use the App Password as `SMTP_PASS`; do not use your normal Gmail password.

Render environment variables:

- `EMAIL_PROVIDER=smtp`
- `EMAIL_FROM=Portfolio Builder <yourgmail@gmail.com>`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=yourgmail@gmail.com`
- `SMTP_PASS=<16-character Google app password>`
- `SMTP_REJECT_UNAUTHORIZED=true`
- `SMTP_EHLO_NAME=portfolio-builder.local`

## Important follow-up

Schema changes now run through `src/db/migrations`. Add future schema updates as new numbered migration files and run `npm run migrate` during deploy/pre-deploy when needed.

## Auth sessions

Login returns the legacy JSON access token and also sets HttpOnly access/refresh cookies. `/auth/refresh` rotates refresh tokens through the `sessions` table, and `/auth/logout` revokes the active refresh token when present.

## Asset lifecycle

Image uploads are recorded in `upload_assets`. If a portfolio item points to a tracked Cloudinary asset, deleting or replacing the item attempts to delete the Cloudinary asset as well.

## CV parser / AI

The default parser is free and deterministic:

- `AI_PROVIDER=heuristic`

For stronger CV extraction, configure one of these hosted providers. The backend always falls back to the heuristic parser when a hosted provider fails, times out, or hits a rate limit.

You can also configure an ordered provider chain:

```env
AI_PROVIDER_CHAIN=gemini,groq,openrouter,openai,heuristic
```

When `AI_PROVIDER_CHAIN` is set, it overrides `AI_PROVIDER`. The backend tries each provider in order and stops at the first successful result.

Recommended Render setup for multi-provider fallback:

```env
AI_PROVIDER_CHAIN=gemini,groq,openrouter,heuristic
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-2.5-flash-lite
GROQ_API_KEY=<your Groq API key>
GROQ_MODEL=llama-3.1-8b-instant
OPENROUTER_API_KEY=<your OpenRouter API key>
OPENROUTER_MODEL=google/gemma-3-27b-it:free
OPENROUTER_REFERER=https://<your-vercel-domain>
OPENROUTER_TITLE=Portfolio Builder
AI_TIMEOUT_MS=20000
AI_MAX_INPUT_CHARS=50000
```

Only include providers whose API keys you have. For example, if you only have Gemini and Groq:

```env
AI_PROVIDER_CHAIN=gemini,groq,heuristic
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-2.5-flash-lite
GROQ_API_KEY=<your Groq API key>
GROQ_MODEL=llama-3.1-8b-instant
```

### Recommended free/low-cost provider: Gemini

Gemini is the best fit for this project because it has free-tier models and supports structured JSON output for extraction tasks.

How to get the configuration:

1. Open Google AI Studio: <https://aistudio.google.com/app/apikey>
2. Sign in with a Google account.
3. Create an API key.
4. Add these variables in Render:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-2.5-flash-lite
AI_TIMEOUT_MS=20000
AI_MAX_INPUT_CHARS=50000
```

Notes:

- Gemini free tier is good for prototyping, but limits and model availability can change.
- Free-tier prompts may be used to improve Google products. For production CV data, consider paid tier or add a user disclosure.

References:

- <https://ai.google.dev/gemini-api/docs/pricing>
- <https://ai.google.dev/gemini-api/docs/structured-output>

### OpenAI

OpenAI is stable for structured extraction, but API usage usually requires billing/credits.

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=<key>`
- `OPENAI_MODEL=gpt-4o-mini`

How to get the configuration:

1. Open <https://platform.openai.com/api-keys>
2. Create an API key.
3. Add billing/prepaid credits if required.
4. Add these variables in Render:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=20000
AI_MAX_INPUT_CHARS=50000
```

References:

- <https://platform.openai.com/docs/quickstart/authentication>
- <https://platform.openai.com/docs/models/gpt-4o-mini>
- <https://platform.openai.com/docs/pricing>

### Groq

Groq is useful when you want very fast inference with free plan limits.

How to get the configuration:

1. Open <https://console.groq.com/keys>
2. Create an API key.
3. Check current model availability and limits in the Groq console.
4. Add these variables in Render:

```env
AI_PROVIDER=groq
GROQ_API_KEY=<your Groq API key>
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_MS=20000
AI_MAX_INPUT_CHARS=50000
```

Reference:

- <https://console.groq.com/docs/rate-limits>

### OpenRouter

OpenRouter can route to many free models, but free usage is usually too limited for production. Use it for testing or as a fallback experiment.

How to get the configuration:

1. Open <https://openrouter.ai/settings/keys>
2. Create an API key.
3. Pick a model with a `:free` suffix from the OpenRouter model list.
4. Add these variables in Render:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=<your OpenRouter API key>
OPENROUTER_MODEL=google/gemma-3-27b-it:free
OPENROUTER_REFERER=https://<your-vercel-domain>
OPENROUTER_TITLE=Portfolio Builder
AI_TIMEOUT_MS=20000
AI_MAX_INPUT_CHARS=50000
```

References:

- <https://openrouter.ai/docs/api/reference/limits>
- <https://openrouter.ai/docs/routing/model-variants>

## Backend verification

Smoke test public backend:

```bash
npm run verify:backend
```

Run against Render:

```bash
BASE_URL=https://portofolio-builder.onrender.com npm run verify:backend
```

To test authenticated flows, create a seeded demo user first and pass:

```bash
TEST_EMAIL=demo@example.com TEST_PASSWORD=DemoPass123 BASE_URL=https://portofolio-builder.onrender.com npm run verify:backend
```

Optional upload checks:

- `TEST_IMAGE_PATH=/path/to/image.png`
- `TEST_CV_PATH=/path/to/cv.pdf`
