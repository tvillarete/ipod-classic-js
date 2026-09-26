<div align="center">

# iPod.js

**The iPod Classic, rebuilt for the streaming era.**

Spotify and Apple Music in a pixel-perfect iPod Classic, complete with click wheel, games, and themes.

[Try it live](https://tannerv.com/ipod)

![ipod](https://user-images.githubusercontent.com/21055469/71572818-c877a780-2a95-11ea-9e4e-6b0476ff172b.gif)

</div>

---

## Quick Start

```bash
pnpm install
pnpm dev
```

On first run, you'll be prompted to enter values for each secret (Spotify credentials, Apple Developer Token). These are stored in a local Cloudflare Secrets Store managed by Wrangler.

Visit **[http://127.0.0.1:3000/ipod](http://127.0.0.1:3000/ipod)** to start.

> Use `127.0.0.1` instead of `localhost`. Spotify's redirect URIs require it.

## Secrets

This project uses [Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/) for managing secrets in both production and local development.

### First-time setup

Running `pnpm dev` will automatically detect missing secrets and prompt you for values. You can also run the setup manually:

```bash
pnpm sync-dev-vars
```

You'll need the following values:

| Secret | How to get it |
|---|---|
| `SPOTIFY_CLIENT_ID` | Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Same Spotify app — copy the Client Secret |
| `APPLE_DEVELOPER_TOKEN` | See the [Apple Music JWT Generator](https://github.com/tvillarete/apple-music-jwt-generator) |

### Spotify redirect URI

Add `http://127.0.0.1:3000/ipod` as a redirect URI in your Spotify app settings. Must be `127.0.0.1`, not `localhost`.

### Updating secrets

To update local secret values at any time:

```bash
pnpm sync-dev-vars
```

## Deployment

Deployed on [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/cloudflare).

```bash
pnpm build                        # Next.js + Serwist service worker
npx opennextjs-cloudflare build   # Bundle for Cloudflare Workers
npx opennextjs-cloudflare deploy  # Deploy to production
```

Production secrets are managed in the [Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/) via the dashboard or `wrangler secrets-store` CLI.

## Built With

Next.js, React, TypeScript, Styled Components, Motion.

## License

MIT

---

<div align="center">

**[Tanner Villarete](https://tannerv.com)** · [LinkedIn](http://linkedin.com/in/tvillarete)

[![GitHub stars](https://img.shields.io/github/stars/tvillarete/ipod-classic-js?style=social)](https://github.com/tvillarete/ipod-classic-js/stargazers)

</div>
