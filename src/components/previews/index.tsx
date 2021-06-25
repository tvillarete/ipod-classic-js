import GamesPreview from './GamesPreview';
import MusicPreview from './MusicPreview';
import NowPlayingPreview from './NowPlayingPreview';
import ServicePreview from './ServicePreview';
import SettingsPreview from './SettingsPreview';
import ThemePreview from './ThemePreview';

export enum PREVIEW {
  MUSIC = 'music',
  GAMES = 'games',
  SETTINGS = 'settings',
  NOW_PLAYING = 'nowPlaying',
  SERVICE = 'service',
  THEME = 'theme',
}

export const Previews = {
  [PREVIEW.MUSIC]: () => <MusicPreview />,
  [PREVIEW.GAMES]: () => <GamesPreview />,
  [PREVIEW.SETTINGS]: () => <SettingsPreview />,
  [PREVIEW.NOW_PLAYING]: () => <NowPlayingPreview />,
  [PREVIEW.SERVICE]: () => <ServicePreview />,
  [PREVIEW.THEME]: () => <ThemePreview />,
};
