import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  useMKDataFetcher,
  useMusicKit,
  useSettings,
  useSpotifyDataFetcher,
} from 'hooks';

interface UserLibraryProps {
  inLibrary?: boolean;
  userId?: string;
}

interface CommonFetcherProps {
  /** Data will not be fetched until the `fetch` function is called. */
  lazy?: boolean;
}

interface PlaylistFetcherProps extends UserLibraryProps {
  id: string;
}

interface AlbumFetcherProps extends UserLibraryProps {
  id: string;
}

interface AlbumsFetcherProps {
  artworkSize?: number;
}

interface ArtistFetcherProps extends UserLibraryProps {
  id: string;
  artworkSize?: number;
}

interface SearchFetcherProps extends UserLibraryProps {
  query: string;
}

const useDataFetchers = () => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const appleDataFetcher = useMKDataFetcher();
  const { service, isAppleAuthorized, isSpotifyAuthorized } = useSettings();
  const { isConfigured } = useMusicKit();

  const enabled =
    (service === 'apple' && isAppleAuthorized && isConfigured) ||
    (service === 'spotify' && isSpotifyAuthorized);

  return { spotifyDataFetcher, appleDataFetcher, service, enabled };
};

export const useFetchAlbum = (
  options: CommonFetcherProps & AlbumFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery(
    ['album', { id: options.id }],
    async () => {
      if (service === 'apple') {
        return appleDataFetcher.fetchAlbum(options.id, options.inLibrary);
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchAlbum({ id: options.id });
      }
    },
    { enabled: enabled && !options.lazy }
  );
};

export const useFetchAlbums = (
  options: CommonFetcherProps & AlbumsFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery(
    ['albums'],
    async ({ pageParam = 0 }) => {
      const params = {
        pageParam,
        limit: 50,
      };

      if (service === 'apple') {
        return appleDataFetcher.fetchAlbums(params);
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchAlbums(params);
      }
    },
    {
      enabled: enabled && !options.lazy,
      getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    }
  );
};

export const useFetchArtists = (options: CommonFetcherProps) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery(
    ['artists'],
    async ({ pageParam = 0 }) => {
      const params = {
        pageParam,
        limit: 20,
        after: pageParam,
      };

      if (service === 'apple') {
        return appleDataFetcher.fetchArtists(params);
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchArtists(params);
      }
    },
    {
      enabled: enabled && !options.lazy,
      // TODO: Figure out a better way to deal with `after` param
      getNextPageParam: (lastPage) =>
        service === 'spotify' ? lastPage?.after : lastPage?.nextPageParam,
    }
  );
};

export const useFetchArtistAlbums = (
  options: CommonFetcherProps & ArtistFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery(
    ['artistAlbums', { id: options.id }],
    async () => {
      if (service === 'apple') {
        return appleDataFetcher.fetchArtistAlbums(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchArtist(options.userId, options.id);
      }
    },
    { enabled: enabled && !options.lazy }
  );
};

export const useFetchPlaylists = (options: CommonFetcherProps) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery(
    ['playlists'],
    async ({ pageParam = 0 }) => {
      const params = {
        limit: 20,
        pageParam,
      };

      if (service === 'apple') {
        return appleDataFetcher.fetchPlaylists(params);
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchPlaylists(params);
      }
    },
    {
      enabled: enabled && !options.lazy,
      getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    }
  );
};

export const useFetchPlaylist = (
  options: CommonFetcherProps & PlaylistFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery(
    ['playlists', { id: options.id }],
    async () => {
      if (service === 'apple') {
        return appleDataFetcher.fetchPlaylist(options.id, options.inLibrary);
      } else if (service === 'spotify') {
        return spotifyDataFetcher.fetchPlaylist(options.id);
      }
    },
    { enabled: enabled && !options.lazy }
  );
};

export const useFetchSearchResults = (
  options: CommonFetcherProps & SearchFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery(
    ['search', { query: options.query }],
    async () => {
      if (service === 'spotify') {
        return spotifyDataFetcher.fetchSearchResults(options.query);
      } else if (service === 'apple') {
        return appleDataFetcher.fetchSearchResults(options.query);
      }
    },
    { enabled: enabled && !options.lazy }
  );
};
