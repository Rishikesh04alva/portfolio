# Rishikesh — Digital Business Card (PWA)

Scan-and-connect contact card for **Rishikesh R Alva**. Installable app + offline support.

## Structure

```
contact-card/
  index.html      card markup
  style.css       mobile-first cyber theme
  script.js       vCard download, copy-email toast, QR, SW registration
  profile.jpg     your photo
  manifest.json   PWA manifest (installable app metadata)
  sw.js           service worker (offline cache)
  icons/          PWA icons (192, 512, maskable, apple-touch)
.github/workflows/
  deploy.yml      auto-publish to GitHub Pages on every push
```

## Deploy to GitHub Pages (free, HTTPS)

The workflow in `.github/workflows/deploy.yml` publishes the `contact-card` folder automatically.

1. **Create a GitHub repo** for this project (no need to init it locally).
2. **Push this folder** to the repo:

```sh
git init
git add .
git commit -m "Add contact card PWA"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

3. In the repo on GitHub: **Settings → Pages → Source: "GitHub Actions"**.
4. The workflow runs on push and the card goes live at:
   `https://<USERNAME>.github.io/<REPO>/`

> Once deployed, the QR code automatically points to the live URL on every device.

### Update & version the cache

After changing files, bump the version in `sw.js`:

```js
const CACHE = "rishikesh-card-v2"; // <- increment
```

## Make it downloadable (installable app)

This is a **Progressive Web App**. Three pieces make it installable:

- `manifest.json` — gives the app a name, icon, theme, and `display: standalone`
- `sw.js` — service worker with a `fetch` handler (required for install) + full offline caching
- HTTPS — free via GitHub Pages

### Install on a phone

| Device | How |
|---|---|
| **Android (Chrome)** | Open the live URL → address bar **Install** icon → *Install app*. |
| **iPhone/iPad (Safari)** | Open the URL → **Share** → **Add to Home Screen** → Add. |
| **Windows (Edge/Chrome)** | Open the URL → **Install app** icon in the address bar. |
| **Mac (Safari)** | Open the URL → **Share** → **Add to Dock**. |

Once installed, the card opens in its own fullscreen window with no browser chrome — exactly like a native app. Since everything is cached by the service worker, it also works **offline**.

## Customization

All contact details (name, phone, email, socials, vCard) live in `contact-card/index.html` and `contact-card/script.js` — the profile photo is `contact-card/profile.jpg`. Re-generate icons if you change the monogram: run `scripts/gen-icons.ps1`.
