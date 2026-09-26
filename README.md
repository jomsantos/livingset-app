# Topps Living Set Checklist

A small React + TypeScript checklist for tracking cards in a Topps Living Set collection.

## Requirements

- Node.js 24
- npm

The project version is pinned in `.tool-versions`.

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Commands

```bash
npm test        # Run unit tests
npm run build   # Type-check and create a production build
npm run preview # Preview the production build
npm run update-cards # Refresh generated checklist data
```

Checklist progress is saved in the browser's `localStorage` and stays on the same device and browser.

## Optional Supabase Cloud Sync

The app supports per-account cloud collection sync. Without configuration it continues to work with browser-local storage.

1. Add the GitHub Actions secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_ID` (instructions below). Dispatch the **Apply Supabase migrations** workflow once to create the initial table; future migration commits to `main` run automatically.
2. In **Authentication → Providers**, enable email sign-in.
3. In **Authentication → URL Configuration**, allow your local Vite URL and the deployed GitHub Pages URL as site/redirect URLs.
4. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project API settings.
5. For GitHub Pages, add repository Actions variables with those same names and values. The deploy workflow passes them into the Vite build.

The browser uses only the public publishable key; row-level security policies in the SQL migration restrict users to their own rows. Never put a Supabase service-role key in this frontend. On first sign-in, the app asks whether to import local progress or start with the cloud collection. Collection progress is separated by set key.

For migration automation, create a Supabase personal access token in your account settings, get the database password (reset it in Project Settings if needed), and copy the project reference from **Project Settings → General**. Store these as GitHub repository **Actions secrets**; they are only used by the migration workflow and are never put in the frontend build.

Card data is generated from the [Hero Habit Topps UCL Living Set checklist](https://herohabit.com/topps-ucl-living-set/) and stored in `src/data/cards.ts`. GitHub Actions checks for source changes weekly and commits a validated update automatically.

## Deployment

This project deploys to GitHub Pages through `.github/workflows/deploy.yml` when changes are pushed to `main`.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
