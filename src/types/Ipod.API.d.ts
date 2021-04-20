declare namespace IpodApi {
  interface Artwork {
    url: string;
  }

  interface Playlist {
    artwork?: Artwork;
    description?: string;
    id: string;
    name: string;
    songs: Song[];
    url: string;
  }

  interface Album {
    // TODO: set up artists support
    artist?: string;
    artwork?: Artwork;
    id: string;
    name: string;
    url: string;
    songs: Song[];
  }

  interface Song {
    artwork?: Artwork;
    albumName?: string;
    artistName?: string;
    duration: number;
    id: string;
    name: string;
    trackNumber: number;
    url: string;
  }
}
