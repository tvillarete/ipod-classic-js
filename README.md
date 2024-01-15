![ipod_og](https://user-images.githubusercontent.com/21055469/71636084-6081a800-2be0-11ea-98ee-9599a3396c84.png)

### by Tanner Villarete | [LinkedIn](http://linkedin.com/in/tvillarete) | [Website](http://tannerv.com)

Before the days of streaming services, we relied on physical devices to store our limited libraries of music. Now with the streaming age, we no longer rely on physical storage and have endless hours of songs at our disposal. This project is an homage to the good 'ol days. A mix of the old and new. Experience the iPod Classic you used to own that now connects to Spotify and Apple Music — the two most popular music streaming platforms in the world.

I built this thing to be very extensible – to the point where it can even run games (like brick!). In the future I might consider adding a few more little apps and easter eggs (theming?).

![ipod](https://user-images.githubusercontent.com/21055469/71572818-c877a780-2a95-11ea-9e4e-6b0476ff172b.gif)

## ✨ Features

- [x] Configured for Vercel
- [x] Next.js 14
- [x] React 18
- [x] Styled Components 6
- [x] Framer Motion 10
- [x] Spotify Web Playback SDK
- [x] Apple MusicKit JS

All SVGs were created from scratch by myself in Figma.

## 🔨 Installing and running locally

### Environment variables

This project utilizes the following environment variables. If you are using Vercel, you can set these in the Vercel dashboard.

#### Spotify Web Playback SDK

Learn more about the Spotify Web Playback SDK [here](https://developer.spotify.com/documentation/web-playback-sdk/quick-start/).

- `SPOTIFY_CLIENT_ID` - The unique identifier of your Spotify app
- `SPOTIFY_CLIENT_SECRET` - The key you will use to authorize Web API or SDK calls

#### Apple MusicKit JS

Learn more about Apple MusicKit JS [here](https://developer.apple.com/documentation/musickitjs). You will need to create a MusicKit identifier and private key in the Apple Developer Portal.

Follow the instructions [here](https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens) to generate a private key.

- `APPLE_DEVELOPER_TOKEN` - A signed token used to authenticate a developer in Apple Music requests

To install this project, you will need to have Node, Yarn, and Vercel on your machine.
Then, run the following commands:

```bash
# Use the recommended Node version specified in the .nvmrc file
nvm use

# Install dependencies
yarn

# Run the app in dev mode using Vercel
yarn start
```

Visit [http://localhost:3000/ipod](http://localhost:3000/ipod) to view the app.
