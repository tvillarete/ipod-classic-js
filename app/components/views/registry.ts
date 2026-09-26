import { AboutView } from "./AboutView";
import { AlbumView } from "./AlbumView";
import { AlbumsView } from "./AlbumsView";
import { ArtistView } from "./ArtistView";
import { ArtistsView } from "./ArtistsView";
import { BrickGameView } from "./BrickGameView";
import { CoverFlowView } from "./CoverFlowView";
import { GamesView } from "./GamesView";
import { HomeView } from "./HomeView";
import { MusicView } from "./MusicView";
import { NowPlayingView } from "./NowPlayingView";
import { PlaylistView } from "./PlaylistView";
import { PlaylistsView } from "./PlaylistsView";
import { SearchView } from "./SearchView";
import { SettingsView } from "./SettingsView";
import { SolitaireGameView } from "./SolitaireGameView";
import { SongsView } from "./SongsView";

export const VIEW_REGISTRY = {
  home: HomeView.viewConfig,
  music: MusicView.viewConfig,
  games: GamesView.viewConfig,
  settings: SettingsView.viewConfig,
  about: AboutView.viewConfig,
  artists: ArtistsView.viewConfig,
  artist: ArtistView.viewConfig,
  albums: AlbumsView.viewConfig,
  album: AlbumView.viewConfig,
  songs: SongsView.viewConfig,
  nowPlaying: NowPlayingView.viewConfig,
  playlists: PlaylistsView.viewConfig,
  playlist: PlaylistView.viewConfig,
  search: SearchView.viewConfig,
  brickGame: BrickGameView.viewConfig,
  solitaireGame: SolitaireGameView.viewConfig,
  coverFlow: CoverFlowView.viewConfig,
} as const;

export type ViewId = keyof typeof VIEW_REGISTRY;

type ExtractProps<T> =
  T extends { component: (...args: infer A) => any }
    ? A extends [infer P, ...any[]]
      ? P
      : {}
    : never;

export type ViewProps = {
  [K in ViewId]: ExtractProps<(typeof VIEW_REGISTRY)[K]>;
};

export type { ViewType, ViewConfigDef } from "./defineView";
