# GoFieldWise Growth Engine (React + Vite)

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure runtime env:

```bash
copy .env.example .env
```

Then edit `.env` and set:

```env
ANTHROPIC_API_KEY=your_real_key_here
PORT=4173
KB_TELEMETRY_ADMIN_TOKEN=replace_with_a_long_random_token
```

Use the same `KB_TELEMETRY_ADMIN_TOKEN` value in the frontend server env so the Connect telemetry panel can authenticate summary requests.

3. Run dev server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

5. Run production server locally:

```bash
npm run start
```

## API key flow

- Client requests go to `/api/anthropic/messages`.
- In dev: Vite proxy forwards to `https://api.anthropic.com/v1/messages`.
- In production: `server.js` handles the route and injects `x-api-key` and `anthropic-version` from `ANTHROPIC_API_KEY`.

This keeps the key out of client-side source during local development.

## Production push workflow

1. Set env on host: `ANTHROPIC_API_KEY` and optional `PORT`.
2. Install deps: `npm ci`.
3. Build + start: `npm run start:prod`.

The production server serves `dist` and executes live API activities through `/api/anthropic/messages`.

## Render auto-deploy setup

This repo now includes `render.yaml` for automatic production pushes.

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Render will detect `render.yaml` and provision the web service.
4. In Render dashboard, set secret env var:
	- `ANTHROPIC_API_KEY` = your real key
5. Deploy.

After setup, every push to your connected branch triggers:

1. `npm ci && npm run build`
2. `npm run start`

Health endpoint used by Render is `/api/health`.
