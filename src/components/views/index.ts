export { default as AboutView } from './AboutView';
export { default as AlbumView } from './AlbumView';
export { default as AlbumsView } from './AlbumsView';
export { default as ArtistsView } from './ArtistsView';
export { default as ArtistView } from './ArtistView';
export { default as BrickGameView } from './BrickGameView';
export { default as CoverFlowView } from './CoverFlowView';
export { default as GamesView } from './GamesView';
export { default as HomeView } from './HomeView';
export { default as MusicView } from './MusicView';
export { default as NowPlayingView } from './NowPlayingView';
export { default as PlaylistView } from './PlaylistView';
export { default as PlaylistsView } from './PlaylistsView';
export { default as SearchView } from './SearchView';
export { default as SettingsView } from './SettingsView';
export { default as SongsView } from './SongsView';

export enum WINDOW_TYPE {
  SPLIT = 'SPLIT',
  FULL = 'FULL',
  COVER_FLOW = 'COVER_FLOW',
  ACTION_SHEET = 'ACTION_SHEET',
  POPUP = 'POPUP',
  KEYBOARD = 'KEYBOARD',
}

type ViewOption = {
  id: string;
  title: string;
  type: WINDOW_TYPE;
};

export const ViewOptions: Record<string, ViewOption> = {
  // Split Screen Views
  home: { id: 'home', title: 'iPod.js', type: WINDOW_TYPE.SPLIT },
  music: { id: 'music', title: 'Music', type: WINDOW_TYPE.SPLIT },
  games: { id: 'games', title: 'Games', type: WINDOW_TYPE.SPLIT },
  settings: { id: 'settings', title: 'Settings', type: WINDOW_TYPE.SPLIT },

  // Fullscreen Views
  about: { id: 'about', title: 'About', type: WINDOW_TYPE.FULL },
  artists: { id: 'artists', title: 'Artists', type: WINDOW_TYPE.FULL },
  artist: { id: 'artist', title: 'Artist', type: WINDOW_TYPE.FULL },
  albums: { id: 'albums', title: 'Albums', type: WINDOW_TYPE.FULL },
  album: { id: 'album', title: 'Album', type: WINDOW_TYPE.FULL },
  songs: { id: 'songs', title: 'Songs', type: WINDOW_TYPE.FULL },
  nowPlaying: {
    id: 'nowPlaying',
    title: 'Now Playing',
    type: WINDOW_TYPE.FULL,
  },
  playlists: { id: 'playlists', title: 'Playlists', type: WINDOW_TYPE.FULL },
  playlist: { id: 'playlist', title: 'Playlist', type: WINDOW_TYPE.FULL },
  search: { id: 'search', title: 'Search', type: WINDOW_TYPE.FULL },
  brickGame: { id: 'brickGame', title: 'Brick', type: WINDOW_TYPE.FULL },

  // CoverFlow view
  coverFlow: {
    id: 'coverFlow',
    title: 'Cover Flow',
    type: WINDOW_TYPE.COVER_FLOW,
  },

  // Action sheets
  mediaActionSheet: {
    id: 'mediaActionSheet',
    title: 'Media Options',
    type: WINDOW_TYPE.ACTION_SHEET,
  },
  serviceTypeActionSheet: {
    id: 'serviceTypeActionSheet',
    title: 'Service',
    type: WINDOW_TYPE.ACTION_SHEET,
  },
  deviceThemeActionSheet: {
    id: 'deviceThemeActionSheet',
    title: 'Device theme',
    type: WINDOW_TYPE.ACTION_SHEET,
  },
  signinPopup: {
    id: 'signinPopup',
    title: 'Sign in',
    type: WINDOW_TYPE.ACTION_SHEET,
  },
  signOutPopup: {
    id: 'signOutPopup',
    title: 'Sign out',
    type: WINDOW_TYPE.ACTION_SHEET,
  },

  // Popups
  spotifyNotSupportedPopup: {
    id: 'spotifyNotSupportedPopup',
    title: 'Unsupported browser',
    type: WINDOW_TYPE.POPUP,
  },
  spotifyNonPremiumPopup: {
    id: 'spotifyNonPremiumPopup',
    title: 'Premium',
    type: WINDOW_TYPE.POPUP,
  },

  // Keyboard
  keyboard: {
    id: 'keyboard',
    title: 'Keyboard',
    type: WINDOW_TYPE.KEYBOARD,
  },
};

export default ViewOptions;
