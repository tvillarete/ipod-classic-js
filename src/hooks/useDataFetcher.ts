import { useCallback, useState } from 'react';

import { useSettings, useSpotifyDataFetcher } from 'hooks';
import * as ConversionUtils from 'utils/conversion';

import useEffectOnce from './useEffectOnce';
import { useMusicKit } from './useMusicKit';

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
}

interface AlbumFetcherProps extends UserLibraryProps {
  name: 'album';
  id: string;
}

type Props = CommonFetcherProps &
  (
    | PlaylistsFetcherProps
    | PlaylistFetcherProps
    | AlbumsFetcherProps
    | AlbumFetcherProps
  );

const useDataFetcher = <TType extends object>(props: Props) => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const { service } = useSettings();
  const { music } = useMusicKit();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<TType>();

  const fetchAlbums = useCallback(async () => {
    let albums: IpodApi.Album[] | undefined;

    if (service === 'apple') {
      const response = await music.api.library.albums(null, {
        include: 'library-albums',
      });

      albums = response.map(ConversionUtils.appleToIpodAlbum);
    } else if (service === 'spotify') {
      albums = await spotifyDataFetcher.fetchAlbums();
    }
    setData(albums as TType);
    setIsLoading(false);
  }, [music.api, service, spotifyDataFetcher]);

  const fetchAlbum = useCallback(
    async (options: AlbumFetcherProps) => {
      let album: IpodApi.Album | undefined;

      if (service === 'apple') {
        const response = options.inLibrary
          ? await music.api.library.album(options.id)
          : await music.api.album(options.id);

        album = ConversionUtils.appleToIpodAlbum(response);
      } else if (service === 'spotify') {
        album = await spotifyDataFetcher.fetchAlbum(options.userId, options.id);
      }
      setData(album as TType);
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

      playlists = response.map(ConversionUtils.appleToIpodPlaylist);
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

        playlist = ConversionUtils.appleToIpodPlaylist(response);
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
        fetchAlbums();
        break;
      case 'album':
        fetchAlbum(props);
        break;
      case 'playlists':
        fetchPlaylists();
        break;
      case 'playlist':
        fetchPlaylist(props);
        break;
    }
  }, [fetchAlbum, fetchAlbums, fetchPlaylist, fetchPlaylists, props]);

  useEffectOnce(() => {
    handleMount();
  });

  return {
    isLoading,
    data,
    hasError,
  };
};

export default useDataFetcher;
