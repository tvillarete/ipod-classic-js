import { SplitScreenPreview } from "components/previews";

export { default as AboutView } from "./AboutView";
export { default as AlbumView } from "./AlbumView";
export { default as AlbumsView } from "./AlbumsView";
export { default as ArtistsView } from "./ArtistsView";
export { default as ArtistView } from "./ArtistView";
export { default as BrickGameView } from "./BrickGameView";
export { default as CoverFlowView } from "./CoverFlowView";
export { default as GamesView } from "./GamesView";
export { default as HomeView } from "./HomeView";
export { default as MusicView } from "./MusicView";
export { default as NowPlayingView } from "./NowPlayingView";
export { default as PlaylistView } from "./PlaylistView";
export { default as PlaylistsView } from "./PlaylistsView";
export { default as SearchView } from "./SearchView";
export { default as SettingsView } from "./SettingsView";
export { default as SongsView } from "./SongsView";

export type ViewType =
  | "screen"
  | "actionSheet"
  | "popup"
  | "keyboard"
  | "coverFlow";

export type ViewConfig = {
  id: string;
  title: string;
  type: ViewType;
  isSplitScreen?: boolean;
  preview?: SplitScreenPreview;
};

export const viewConfigMap: Record<string, ViewConfig> = {
  // Split Screen Views
  home: { id: "home", title: "iPod.js", type: "screen", isSplitScreen: true },
  music: {
    id: "music",
    title: "Music",
    type: "screen",
    isSplitScreen: true,
    preview: SplitScreenPreview.Music,
  },
  games: {
    id: "games",
    title: "Games",
    type: "screen",
    isSplitScreen: true,
    preview: SplitScreenPreview.Games,
  },
  settings: {
    id: "settings",
    title: "Settings",
    type: "screen",
    isSplitScreen: true,
    preview: SplitScreenPreview.Settings,
  },

  // Fullscreen Views
  about: {
    id: "about",
    title: "About",
    type: "screen",
    preview: SplitScreenPreview.Settings,
  },
  artists: {
    id: "artists",
    title: "Artists",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  artist: {
    id: "artist",
    title: "Artist",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  albums: {
    id: "albums",
    title: "Albums",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  album: {
    id: "album",
    title: "Album",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  songs: {
    id: "songs",
    title: "Songs",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  nowPlaying: {
    id: "nowPlaying",
    title: "Now Playing",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  playlists: {
    id: "playlists",
    title: "Playlists",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  playlist: {
    id: "playlist",
    title: "Playlist",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  search: {
    id: "search",
    title: "Search",
    type: "screen",
    preview: SplitScreenPreview.Music,
  },
  brickGame: {
    id: "brickGame",
    title: "Brick",
    type: "screen",
    preview: SplitScreenPreview.Games,
  },

  // CoverFlow view
  coverFlow: {
    id: "coverFlow",
    title: "Cover Flow",
    type: "coverFlow",
    preview: SplitScreenPreview.Music,
  },

  // Action sheets
  mediaActionSheet: {
    id: "mediaActionSheet",
    title: "Media Options",
    type: "actionSheet",
  },
  serviceTypeActionSheet: {
    id: "serviceTypeActionSheet",
    title: "Service",
    type: "actionSheet",
  },
  deviceThemeActionSheet: {
    id: "deviceThemeActionSheet",
    title: "Device theme",
    type: "actionSheet",
  },
  signinPopup: {
    id: "signinPopup",
    title: "Sign in",
    type: "actionSheet",
  },
  signOutPopup: {
    id: "signOutPopup",
    title: "Sign out",
    type: "actionSheet",
  },

  // Popups
  spotifyNotSupportedPopup: {
    id: "spotifyNotSupportedPopup",
    title: "Unsupported browser",
    type: "popup",
  },
  spotifyNonPremiumPopup: {
    id: "spotifyNonPremiumPopup",
    title: "Premium",
    type: "popup",
  },
  musicProviderErrorPopup: {
    id: "musicProviderErrorPopup",
    title: "Error",
    type: "popup",
  },

  // Keyboard
  keyboard: {
    id: "keyboard",
    title: "Keyboard",
    type: "keyboard",
  },
};

export default viewConfigMap;
