declare namespace IpodApi {
  interface Artwork {
    url: string;
  }

  interface Playlist {
    artwork?: Artwork;
    description?: string;
    id: string;
    name: string;
    curatorName: string;
    songs: Song[];
    url: string;
  }

  interface Album {
    // TODO: set up artists support
    artistName?: string;
    artwork?: Artwork;
    id: string;
    name: string;
    url: string;
    songs: Song[];
  }

  interface Artist {
    id: string;
    name: string;
    url: string;
    artwork?: Artwork;
    albums?: Album[];
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

  interface QueueOptions {
    album?: Album;
    playlist?: Playlist;
    songs?: Song[];
    song?: Song;
    startPosition?: number;
  }

  interface MediaItem extends Song {
    playlistArtworkUrl?: string;
    playlistName?: string;
    previewUrl?: string;
  }

  interface SearchResults {
    artists: Artist[];
    songs: Song[];
    albums: Album[];
    playlists: Playlist[];
  }

  interface PaginationParams {
    pageParam: number;
    limit: number;
    after?: string;
  }

  interface PaginatedResponse<TType> {
    data: TType;
    nextPageParam?: number;
    after?: string;
  }
}
