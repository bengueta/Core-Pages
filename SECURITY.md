# Security — Core-Pages

This site is **fully static** (HTML/JS/CSS). There is:

- No server, database, or Convex
- No API keys, `.env`, or secrets in the repository
- No user accounts — calculator saves use **browser `localStorage` only** (never sent to a server)
- Theme builder state stays in the browser until export (copy/download)

Do not add secrets to this repo. If a tool ever needs a backend, use a separate service with env vars in the host (not committed here).
