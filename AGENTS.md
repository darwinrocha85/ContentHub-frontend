# ContentHub Frontend — AGENTS.md

> Proyecto independiente. Abrir opencode con cwd en `ContentHub-frontend/`, nunca en `Projects/`.
> Stack: React 18.3 + Vite 5 + plugin-react. Extra: Stripe (`@stripe/react-stripe-js`).

## Cómo correr
- `npm.cmd install` + `npm.cmd run dev` → `http://localhost:5178` (puerto propio con `strictPort`, sin colisiones)
- Backend esperado en `http://localhost:8002` (ContentHub, puerto propio)
- Sin `run-*.ps1` en este repo

## Contrato API
- URL por env `VITE_API_URL`: dev `http://localhost:8002` (`.env.example`), prod
  `https://contenthub-backend-tyhq.onrender.com` (`.env.production`). Override local: `.env.local`.
- Pagos: Stripe test. Nunca poner claves secret en el frontend (solo publishable).

## Deploy
- Proyecto Firebase propio `contenthub-frontend`, sin targets: `npm.cmd run build` +
  `firebase.cmd deploy --only hosting`

## No hacer
- No hardcodear URLs de API en componentes.
- No commitear `.env.local`, `node_modules/`, `dist/`, `.firebase/` (ver `.gitignore`).
- No cambiar el puerto 5178 sin revisar CORS del backend (`ContentHub/app/main.py`) y `Projects/RUNBOOK.md`.
