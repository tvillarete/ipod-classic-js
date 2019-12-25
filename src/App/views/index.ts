export { default as HomeView } from "./HomeView";
export { default as MusicView } from "./MusicView";
export { default as ArtistsView } from "./ArtistsView";
export { default as ArtistView } from "./ArtistView";
export { default as AlbumView } from "./AlbumView";
export { default as GamesView } from "./GamesView";
export { default as BrickGameView } from "./BrickGameView";

const ViewIds: Record<string, string> = {
  home: "Home",
  music: "Music",
  artists: "Artists",
  artist: "Artist",
  album: "Album",
  games: "Games",
  brickGame: "Brick"
};

export default ViewIds;
