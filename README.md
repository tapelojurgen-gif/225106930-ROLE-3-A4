# STEMMate Namibia: vertical slice (Role 3 version)

React + Vite + Tailwind v4.

```
npm install
npm run dev
```

## Backend
All data access goes through `src/api/plansApi.js`.
- Default: plans are stored on the device (localStorage).
- To use a real backend, create `.env` with `VITE_API_BASE_URL=https://your-api` (endpoints assumed at the top of `plansApi.js`; adjust to the real contract).

See `ACCESSIBILITY_CHECKLIST.md` for the accessibility work.
