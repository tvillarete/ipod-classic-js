![ipod_og](https://user-images.githubusercontent.com/21055469/71636084-6081a800-2be0-11ea-98ee-9599a3396c84.png)

### by Tanner Villarete | [LinkedIn](http://linkedin.com/in/tvillarete) | [Website](http://tannerv.com)

Before the days of streaming services, we relied on physical devices to store our limited libraries of music. Now with the streaming age, we no longer rely on physical storage and have endless hours of songs at our disposal. This project is an homage to the good 'ol days. A mix of the old and new. Experience the iPod Classic you used to own that now connects to Spotify and Apple Music — the two most popular music streaming platforms in the world.

I built this thing to be very extensible – to the point where it can even run games (like brick!). In the future I might consider adding a few more little apps and easter eggs (theming?).

![ipod](https://user-images.githubusercontent.com/21055469/71572818-c877a780-2a95-11ea-9e4e-6b0476ff172b.gif)

## Details

Here's a breakdown of the Full Stack:
#### Frontend: 
- JS: TypeScript, React (Hooks, Context)
- CSS: Styled Components, Framer Motion (for some of the animations)
- Textures/Icons: All SVGs created by me in Figma
- API: Spotify Web Playback SDK / Apple MusicKit JS

## Running Locally

#### NOTE
If you want to develop locally with this project, you'll need to supply an Apple Developer Token using the `token` query parameter. See https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
