# lookatarts.com — Daily Visual Meditation

Look at one artwork a day, for a few unhurried minutes. Artworks come from the
Met Museum's open access collection.

## Architecture (Cloudflare)

Everything runs on Cloudflare in a single Worker:

- **Frontend**: React + Vite + Tailwind, served as static assets ([src/](src/))
- **API**: Hono Worker ([cf/worker.ts](cf/worker.ts)) — today's artwork metadata,
  artwork/audio serving, meditation timer events
- **Database**: D1 `lookatarts-db` (artwork schedule, timer events)
- **Media**: R2 `lookatarts-images` (560 artworks + 4 ambient audio tracks)

## Development

```sh
npm install
npx vite build          # build the frontend into dist/
npx wrangler dev        # run the Worker locally (local D1/R2 simulators)
```

Local D1 schema/data live in [cf/schema.sql](cf/schema.sql); regenerate the data
import from CSV exports with [cf/convert-csv.mjs](cf/convert-csv.mjs).

## Deployment

Pushing to `main` deploys automatically via GitHub Actions
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
Manual deploy: `npx wrangler deploy` (needs `CLOUDFLARE_API_TOKEN`).

## Legacy

[legacy-replit-backend/](legacy-replit-backend/) contains the original FastAPI
backend and the Met Museum scraper from the Replit era (replaced by the Worker).
The scraper's source dataset is the [Met open access CSV](https://github.com/metmuseum/openaccess)
(not committed here — ~300 MB).

The ambient audio mp3 files are not committed either (up to 40 MB each); they
live in the `lookatarts-images` R2 bucket under `audio/`.
