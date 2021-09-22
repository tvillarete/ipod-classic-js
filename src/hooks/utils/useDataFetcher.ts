import { useCallback, useEffect, useState } from 'react';

import { useMKDataFetcher, useSettings, useSpotifyDataFetcher } from 'hooks';

interface UserLibraryProps {
  inLibrary?: boolean;
  userId?: string;
}

interface CommonFetcherProps {
  name: string;
  /** Data will not be fetched until the `fetch` function is called. */
  lazy?: boolean;
}

interface PlaylistsFetcherProps {
  name: 'playlists';
}

interface PlaylistFetcherProps extends UserLibraryProps {
  name: 'playlist';
  id: string;
}

interface AlbumsFetcherProps {
  name: 'albums';
  artworkSize?: number;
}

interface AlbumFetcherProps extends UserLibraryProps {
  name: 'album';
  id: string;
}

interface ArtistsFetcherProps {
  name: 'artists';
}

interface ArtistFetcherProps extends UserLibraryProps {
  name: 'artist';
  id: string;
  artworkSize?: number;
}

interface SearchFetcherProps extends UserLibraryProps {
  name: 'search';
  query: string;
}

type Props = CommonFetcherProps &
  (
    | PlaylistsFetcherProps
    | PlaylistFetcherProps
    | AlbumsFetcherProps
    | AlbumFetcherProps
    | ArtistsFetcherProps
    | ArtistFetcherProps
    | SearchFetcherProps
  );

const useDataFetcher = <TType extends object>(props: Props) => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const appleDataFetcher = useMKDataFetcher();
  const { service, isAppleAuthorized, isSpotifyAuthorized } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<TType>();
  const [isMounted, setIsMounted] = useState(false);

  const fetchAlbums = useCallback(async () => {
    let albums: IpodApi.Album[] | undefined;

    if (service === 'apple') {
      albums = await appleDataFetcher.fetchAlbums();
    } else if (service === 'spotify') {
      albums = await spotifyDataFetcher.fetchAlbums();
    }

    setData(albums as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchAlbum = useCallback(
    async (options: AlbumFetcherProps) => {
      let album: IpodApi.Album | undefined;

      if (service === 'apple') {
        album = await appleDataFetcher.fetchAlbum(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        album = await spotifyDataFetcher.fetchAlbum(options.userId, options.id);
      }

      setData(album as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const fetchArtists = useCallback(async () => {
    let artists: IpodApi.Artist[] | undefined;

    if (service === 'apple') {
      artists = await appleDataFetcher.fetchArtists();
    } else if (service === 'spotify') {
      artists = await spotifyDataFetcher.fetchArtists();
    }
    setData(artists as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchArtistAlbums = useCallback(
    async (options: ArtistFetcherProps) => {
      let albums: IpodApi.Album[] | undefined;

      if (service === 'apple') {
        albums = await appleDataFetcher.fetchArtistAlbums(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        albums = await spotifyDataFetcher.fetchArtist(
          options.userId,
          options.id
        );
      }

      setData(albums as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const fetchPlaylists = useCallback(async () => {
    let playlists: IpodApi.Playlist[] | undefined;

    if (service === 'apple') {
      playlists = await appleDataFetcher.fetchPlaylists();
    } else if (service === 'spotify') {
      playlists = await spotifyDataFetcher.fetchPlaylists();
    }

    setData(playlists as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchPlaylist = useCallback(
    async (options: PlaylistFetcherProps) => {
      let playlist: IpodApi.Playlist | undefined;

      if (service === 'apple') {
        playlist = await appleDataFetcher.fetchPlaylist(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        playlist = await spotifyDataFetcher.fetchPlaylist(
          options.userId,
          options.id
        );
      }
      setData(playlist as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const fetchSearchResults = useCallback(
    async (options: SearchFetcherProps) => {
      setIsLoading(true);
      let searchResults: IpodApi.SearchResults | undefined;

      if (service === 'spotify') {
        searchResults = await spotifyDataFetcher.fetchSearchResults(
          options.query
        );
      }

      setData(searchResults as TType);
      setIsLoading(false);
    },
    [service, spotifyDataFetcher]
  );

  const handleFetch = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    switch (props.name) {
      case 'albums':
        fetchAlbums();
        break;
      case 'album':
        await fetchAlbum(props);
        break;
      case 'artists':
        await fetchArtists();
        break;
      case 'artist':
        await fetchArtistAlbums(props);
        break;
      case 'playlists':
        await fetchPlaylists();
        break;
      case 'playlist':
        await fetchPlaylist(props);
        break;
      case 'search':
        await fetchSearchResults(props);
        break;
    }

    setIsMounted(true);
  }, [
    fetchAlbum,
    fetchAlbums,
    fetchArtistAlbums,
    fetchArtists,
    fetchPlaylist,
    fetchPlaylists,
    fetchSearchResults,
    props,
  ]);

  useEffect(() => {
    // Data fetching will be manually triggered when lazy is true.
    if (props.lazy) {
      setIsLoading(false);
      return;
    }

    if (
      !isMounted &&
      ((service === 'apple' && isAppleAuthorized) ||
        (service === 'spotify' && isSpotifyAuthorized))
    ) {
      handleFetch();
    } else {
      setIsLoading(false);
    }
  }, [
    handleFetch,
    isAppleAuthorized,
    isMounted,
    isSpotifyAuthorized,
    props.lazy,
    service,
  ]);

  return {
    isLoading,
    data,
    hasError,
    fetch: handleFetch,
  };
};

export default useDataFetcher;
