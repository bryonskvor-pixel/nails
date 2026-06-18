# Nails by Marissa — AI Nail Generator

## Repo structure

```
nailsbymarissa.site/
  public/
    index.html          ← existing homepage (untouched)
    hands/
      hand-01.jpg       ← Fair / Cool adult
      hand-02.jpg       ← Fair / Warm adult
      hand-03.jpg       ← Medium adult
      hand-04.jpg       ← Warm / Golden adult
      hand-05.jpg       ← Olive adult
      hand-06.jpg       ← Deep / Warm adult
      hand-07.jpg       ← Deep / Rich adult
      hand-08.jpg       ← Deep / Cool adult
      hand-09.jpg       ← Fair teen
      hand-10.jpg       ← Medium teen
      hand-11.jpg       ← Deep teen
      hand-12.jpg       ← Fair tween
      hand-13.jpg       ← Medium tween
      hand-14.jpg       ← Deep tween
  app/
    generator/
      page.jsx          ← Generator UI (nailsbymarissa.site/generator)
    api/
      themes/route.js       ← Airtable theme fetch
      generate/route.js     ← Flux Kontext image generation
      poll/route.js         ← BFL result polling
      build-prompt/route.js ← Claude prompt builder
      download/route.js     ← Image download proxy
      credits/route.js      ← Session credit tracking
  next.config.js
  package.json
  .env.example
```

## Setup

1. Move your existing `index.html` into `/public/index.html`
2. Add your hand photos to `/public/hands/`
3. Copy `.env.example` to `.env.local` and fill in your keys
4. Add all env vars to Vercel → Settings → Environment Variables
5. `npm install` then `npm run dev` to test locally
6. Push to GitHub — Vercel auto-deploys

## Vercel env vars required

| Variable | Description |
|---|---|
| `BFL_API_KEY` | Black Forest Labs API key |
| `AIRTABLE_API_KEY` | Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | `app59lbm3ckXDYQio` |
| `AIRTABLE_TABLE_ID` | `tblKiNQGmWF20uCvw` |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `FREE_GENERATIONS` | Free generations before booking gate (default: 3) |
| `BOOKING_UNLOCK_COUNT` | Bonus generations after booking (default: 5) |
| `BOOKING_URL` | Your booking link |
| `SALON_NAME` | Salon name shown in booking CTA |

## The homepage

The existing `index.html` is served by Next.js from `/public` at the root `/` route. 
It is completely untouched by the generator.
