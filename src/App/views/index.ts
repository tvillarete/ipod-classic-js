export { default as CoverFlowView } from "./CoverFlowView";
export { default as HomeView } from "./HomeView";
export { default as MusicView } from "./MusicView";
export { default as ArtistsView } from "./ArtistsView";
export { default as ArtistView } from "./ArtistView";
export { default as AlbumsView } from "./AlbumsView";
export { default as AlbumView } from "./AlbumView";
export { default as NowPlayingView } from "./NowPlayingView";
export { default as GamesView } from "./GamesView";
export { default as BrickGameView } from "./BrickGameView";

export enum WINDOW_TYPE {
  SPLIT = "SPLIT",
  FULL = "FULL",
  COVER_FLOW = "COVER_FLOW"
}

type ViewOption = {
  id: string;
  title: string;
  type: WINDOW_TYPE;
};

export const ViewOptions: Record<string, ViewOption> = {
  // Split Screen Views
  home: { id: "home", title: "iPod.js", type: WINDOW_TYPE.SPLIT },
  music: { id: "music", title: "Music", type: WINDOW_TYPE.SPLIT },
  games: { id: "games", title: "Games", type: WINDOW_TYPE.SPLIT },

  // Fullscreen Views
  artists: { id: "artists", title: "Artists", type: WINDOW_TYPE.FULL },
  artist: { id: "artist", title: "Artist", type: WINDOW_TYPE.FULL },
  albums: { id: "albums", title: "Albums", type: WINDOW_TYPE.FULL },
  album: { id: "album", title: "Album", type: WINDOW_TYPE.FULL },
  nowPlaying: {
    id: "nowPlaying",
    title: "Now Playing",
    type: WINDOW_TYPE.FULL
  },
  brickGame: { id: "brickGame", title: "Brick", type: WINDOW_TYPE.FULL },

  // CoverFlow view
  coverFlow: {
    id: "coverFlow",
    title: "Cover Flow",
    type: WINDOW_TYPE.COVER_FLOW
  }
};

export default ViewOptions;
