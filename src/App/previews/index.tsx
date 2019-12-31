import React from 'react';

import GamesPreview from './GamesPreview';
import MusicPreview from './MusicPreview';
import NowPlayingPreview from './NowPlayingPreview';
import SettingsPreview from './SettingsPreview';

export enum PREVIEW {
  MUSIC = "music",
  GAMES = "games",
  SETTINGS = "settings",
  NOW_PLAYING = "nowPlaying"
}

export const Previews = {
  [PREVIEW.MUSIC]: () => <MusicPreview />,
  [PREVIEW.GAMES]: () => <GamesPreview />,
  [PREVIEW.SETTINGS]: () => <SettingsPreview />,
  [PREVIEW.NOW_PLAYING]: () => <NowPlayingPreview />
};
