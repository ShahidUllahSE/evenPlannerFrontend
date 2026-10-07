# EventSphere Frontend

React + TypeScript + Vite panel for EventSphere: events, guest lists, QR tickets, invitation emails and door check-in. All data comes from the backend in `D:\evenPlannerBackend`.

## Setup

1. Start the backend first (see its README). It runs on `http://localhost:5050/api`.
2. Then:

```bash
npm install
cp .env.example .env    # only needed if the API is not on localhost:5050
npm run dev             # http://localhost:5173
```

Sign in with the admin account created by the backend's `npm run seed:admin`.

The backend's `CLIENT_URL` must include the address you open the frontend on (for example `http://localhost:5173`), or the browser blocks the requests (CORS).

## Who sees what

| Page | Admin | Planner | Scanner |
|---|---|---|---|
| Dashboard, Events, All Guests, Send Email | Everything | Own events | – |
| Accounts / My Scanners | All accounts | Scanners they created | – |
| QR Scanner | Any event | Own events | Assigned events |
| Scan History | Everything | Scans at own events | Own scans |

Scanners land on the QR Scanner page after signing in. Assign scanners to an event from the **Door Scanners** card on the event page.

## Scanning at the door

Open **QR Scanner** on a phone, pick the event and tap **Start camera**. Each ticket is accepted once; scanning it again shows when and by whom it was first used. A ticket code can also be typed by hand.

Browsers only allow camera access on **HTTPS** or `localhost`. For phones on your network, serve the app over HTTPS (for example behind a reverse proxy with a certificate, or a tunnel such as ngrok or Cloudflare Tunnel). Over plain `http://` the page still works, but only with typed ticket codes.

## Scripts

- `npm run dev` – development server
- `npm run build` – type-check and production build into `dist/`
- `npm run lint` – oxlint
