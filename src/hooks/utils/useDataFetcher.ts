import { useCallback, useEffect, useState } from 'react';

import { useMusicKit, useSettings, useSpotifyDataFetcher } from 'hooks';
import * as ConversionUtils from 'utils/conversion';

interface UserLibraryProps {
  inLibrary?: boolean;
  userId?: string;
}

interface CommonFetcherProps {
  name: string;
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

type Props = CommonFetcherProps &
  (
    | PlaylistsFetcherProps
    | PlaylistFetcherProps
    | AlbumsFetcherProps
    | AlbumFetcherProps
    | ArtistsFetcherProps
    | ArtistFetcherProps
  );

const useDataFetcher = <TType extends object>(props: Props) => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const { service, isAppleAuthorized, isSpotifyAuthorized } = useSettings();
  const { music } = useMusicKit();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<TType>();
  const [isMounted, setIsMounted] = useState(false);

  const fetchAlbums = useCallback(
    async (options: AlbumsFetcherProps) => {
      let albums: IpodApi.Album[] | undefined;

      if (service === 'apple') {
        const response = await music.api.library.albums(null, {
          include: 'library-albums',
        });

        albums = response.map((item) =>
          ConversionUtils.convertAppleAlbum(item, options.artworkSize)
        );
      } else if (service === 'spotify') {
        albums = await spotifyDataFetcher.fetchAlbums();
      }
      setData(albums as TType);
      setIsLoading(false);
    },
    [music.api, service, spotifyDataFetcher]
  );

  const fetchAlbum = useCallback(
    async (options: AlbumFetcherProps) => {
      let album: IpodApi.Album | undefined;

      if (service === 'apple') {
        const response = options.inLibrary
          ? await music.api.library.album(options.id)
          : await music.api.album(options.id);

        album = ConversionUtils.convertAppleAlbum(response);
      } else if (service === 'spotify') {
        album = await spotifyDataFetcher.fetchAlbum(options.userId, options.id);
      }
      setData(album as TType);
      setIsLoading(false);
    },
    [music.api, service, spotifyDataFetcher]
  );

  const fetchArtists = useCallback(async () => {
    let artists: IpodApi.Artist[] | undefined;

    if (service === 'apple') {
      const response = await music.api.library.artists(null, {
        include: 'catalog',
        limit: 100,
      });

      artists = response.map(ConversionUtils.convertAppleArtist);
    } else if (service === 'spotify') {
      artists = await spotifyDataFetcher.fetchArtists();
    }
    setData(artists as TType);
    setIsLoading(false);
  }, [music.api, service, spotifyDataFetcher]);

  const fetchArtistAlbums = useCallback(
    async (options: ArtistFetcherProps) => {
      let albums: IpodApi.Album[] | undefined;

      if (service === 'apple') {
        const response = options.inLibrary
          ? await music.api.library.artistRelationship(options.id, 'albums')
          : await music.api.artistRelationship(options.id, 'albums');

        albums = response.map((item) =>
          ConversionUtils.convertAppleAlbum(item, options.artworkSize)
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
    [music.api, service, spotifyDataFetcher]
  );

  const fetchPlaylists = useCallback(async () => {
    let playlists: IpodApi.Playlist[] | undefined;

    if (service === 'apple') {
      const response = await music.api.library.playlists(null, {
        limit: 100,
      });

      playlists = response.map(ConversionUtils.convertApplePlaylist);
    } else if (service === 'spotify') {
      playlists = await spotifyDataFetcher.fetchPlaylists();
    }
    setData(playlists as TType);
    setIsLoading(false);
  }, [music.api.library, service, spotifyDataFetcher]);

  const fetchPlaylist = useCallback(
    async (options: PlaylistFetcherProps) => {
      let playlist: IpodApi.Playlist | undefined;

      if (service === 'apple') {
        const response = options.inLibrary
          ? await music.api.library.playlist(options.id)
          : await music.api.playlist(options.id);

        playlist = ConversionUtils.convertApplePlaylist(response);
      } else if (service === 'spotify') {
        playlist = await spotifyDataFetcher.fetchPlaylist(
          options.userId,
          options.id
        );
      }
      setData(playlist as TType);
      setIsLoading(false);
    },
    [music.api, service, spotifyDataFetcher]
  );

  const handleMount = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    switch (props.name) {
      case 'albums':
        await fetchAlbums(props);
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
    }

    setIsMounted(true);
  }, [
    fetchAlbum,
    fetchAlbums,
    fetchArtistAlbums,
    fetchArtists,
    fetchPlaylist,
    fetchPlaylists,
    props,
  ]);

  useEffect(() => {
    if (
      !isMounted &&
      ((service === 'apple' && isAppleAuthorized) ||
        (service === 'spotify' && isSpotifyAuthorized))
    ) {
      handleMount();
    } else {
      setIsLoading(false);
    }
  }, [handleMount, isAppleAuthorized, isMounted, isSpotifyAuthorized, service]);

  return {
    isLoading,
    data,
    hasError,
  };
};

export default useDataFetcher;
