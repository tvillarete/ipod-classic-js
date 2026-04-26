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

Visit **[http://127.0.0.1:3000/ipod](http://127.0.0.1:3000/ipod)** to start.

> Use `127.0.0.1` instead of `localhost`. Spotify's redirect URIs require it.

## Configuration

Create a `.env.local` file:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
APPLE_DEVELOPER_TOKEN=your_apple_developer_token
```

### Spotify

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add `http://127.0.0.1:3000/ipod` as a redirect URI (must be `127.0.0.1`, not `localhost`)
3. Copy your Client ID and Client Secret

### Apple Music

1. Join the [Apple Developer Program](https://developer.apple.com/programs/)
2. Create a MusicKit identifier and generate a private key
3. Create a developer token (JWT). See the [Apple Music JWT Generator](https://github.com/tvillarete/apple-music-jwt-generator) for help

## Built With

Next.js, React, TypeScript, Styled Components, Motion. Deployed on Vercel.

## License

MIT

---

<div align="center">

**[Tanner Villarete](https://tannerv.com)** · [LinkedIn](http://linkedin.com/in/tvillarete)

[![GitHub stars](https://img.shields.io/github/stars/tvillarete/ipod-classic-js?style=social)](https://github.com/tvillarete/ipod-classic-js/stargazers)

</div>
