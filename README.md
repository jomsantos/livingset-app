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

Card data is generated from the [Hero Habit Topps Living Set checklist](https://herohabit.com/topps-baseball-living-set/) and stored in `src/data/cards.ts`. GitHub Actions checks for source changes weekly and commits a validated update automatically.

## Deployment

This project deploys to GitHub Pages through `.github/workflows/deploy.yml` when changes are pushed to `main`.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
