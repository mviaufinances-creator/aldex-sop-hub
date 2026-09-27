# Aldex SOP Hub

Internal step-by-step SOP tool for Aldex Chemical (Sales & Logistics, Shipping & Receiving).
The whole site is one self-contained page, `Aldex_SOP_Hub.html` (screenshots embedded).

## Run it

```bash
npm start            # serves the hub on http://localhost:8795 (or $PORT)
```

No dependencies. `server.js` serves only the hub page (plus `/health`), never the rest of this folder.

## Deploy on Railway

Railway detects `package.json` and runs `npm start`; the server listens on Railway's `PORT`.
After the first successful deploy, open the service → **Settings → Networking → Generate Domain**
to get a public URL.

## Edit the SOPs

1. Change the text in `src/content.js` (English and French side by side), the UI in `src/app.js` / `src/app.html`, or screenshots in `src/img/`.
2. Rebuild the page: `python3 build.py` (writes `Aldex_SOP_Hub.html`).
3. Commit and push — Railway redeploys automatically.
