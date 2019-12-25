export { default as HomeView } from "./HomeView";
export { default as MusicView } from "./MusicView";
export { default as ArtistsView } from "./ArtistsView";
export { default as ArtistView } from "./ArtistView";

const ViewIds: Record<string, string> = {
  home: "Home",
  music: "Music",
  artists: "Artists",
  artist: "Artist"
};

export default ViewIds;
