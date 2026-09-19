# Project Guidelines

## Stack

- React with TypeScript, built with Vite.
- Node.js 24 is the supported runtime. The version is pinned in `.tool-versions`.
- The app is a static site and is deployed to GitHub Pages through `.github/workflows/deploy.yml`.

## Commands

- `npm install` installs dependencies locally.
- `npm run dev` starts the local development server.
- `npm run build` runs TypeScript checks and creates the production build.
- `npm test` runs the unit test suite once.

## Code Guidelines

- Keep components and behavior in `src/`.
- Prefer typed React state and accessible native controls.
- Keep checklist persistence in `localStorage`; do not add a backend for this static app.
- Keep the Vite base path relative so the app works under a GitHub Pages repository path.
- Avoid committing `node_modules` or `dist`.

## Testing Guidelines

- Add or update unit tests when changing checklist behavior.
- Test user-visible behavior through accessible roles and labels rather than implementation details.
- Keep tests deterministic by clearing `localStorage` between cases.
