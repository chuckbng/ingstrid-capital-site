# Ingstrid Capital Website

This folder contains the first deployable version of the Ingstrid Capital website and internal terminal prototype.

## Files

- `index.html` — public Ingstrid Capital website
- `terminal.html` — Ingstrid Terminal Dashboard V3
- `README.md` — project notes

## How to test locally

1. Open the project folder.
2. Double-click `index.html`.
3. Click **Launch Terminal** to open `terminal.html`.
4. In the terminal, use the command bar with commands like:
   - `SOFI`
   - `HOOD`
   - `RKLB`
   - `PLTR`
   - `OC`
   - `JOURNAL`
   - `RISK`

## Deployment

Upload these three files to a GitHub repository and deploy with Vercel.

Recommended repository name:

```text
ingstrid-capital-site
```

Vercel settings:

- Framework Preset: Other
- Build Command: leave blank
- Output Directory: leave blank

## Notes

The terminal currently uses demo market data and browser local storage. It is not connected to live market data yet.

Recommended next upgrades:

1. CSV export/import for trade journal
2. Login protection for terminal page
3. Real stock price feed
4. Earnings date feed
5. Options chain and IV data
6. Database storage
