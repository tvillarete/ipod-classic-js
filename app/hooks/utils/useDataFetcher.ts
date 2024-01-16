import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  useMKDataFetcher,
  useMusicKit,
  useSettings,
  useSpotifyDataFetcher,
} from "hooks";

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
    (service === "apple" && isAppleAuthorized && isConfigured) ||
    (service === "spotify" && isSpotifyAuthorized);

  return { spotifyDataFetcher, appleDataFetcher, service, enabled };
};

export const useFetchAlbum = (
  options: CommonFetcherProps & AlbumFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery({
    queryKey: ["album", { id: options.id }],
    queryFn: async () => {
      if (service === "apple") {
        return appleDataFetcher.fetchAlbum(options.id, options.inLibrary);
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchAlbum({ id: options.id });
      }
    },
    enabled: enabled && !options.lazy,
  });
};

export const useFetchAlbums = (
  options: CommonFetcherProps & AlbumsFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery({
    queryKey: ["albums"],
    queryFn: async ({ pageParam }) => {
      const params = {
        pageParam,
        limit: 50,
      };

      if (service === "apple") {
        return appleDataFetcher.fetchAlbums(params);
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchAlbums(params);
      }
    },
    enabled: enabled && !options.lazy,
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    initialPageParam: 0,
  });
};

export const useFetchArtists = (options: CommonFetcherProps) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery({
    queryKey: ["artists"],
    queryFn: async ({ pageParam }) => {
      const params = {
        pageParam,
        limit: 20,
        after: `${pageParam}`,
      };

      if (service === "apple") {
        return appleDataFetcher.fetchArtists(params);
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchArtists(params);
      }
    },
    enabled: enabled && !options.lazy,
    // TODO: Figure out a better way to deal with `after` param
    getNextPageParam: (lastPage) =>
      service === "spotify"
        ? (lastPage?.after as any)
        : lastPage?.nextPageParam,
    initialPageParam: 0,
  });
};

export const useFetchArtistAlbums = (
  options: CommonFetcherProps & ArtistFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery({
    queryKey: ["artistAlbums", { id: options.id }],
    queryFn: async () => {
      if (service === "apple") {
        return appleDataFetcher.fetchArtistAlbums(
          options.id,
          options.inLibrary
        );
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchArtist(options.id);
      }
    },
    enabled: enabled && !options.lazy,
  });
};

export const useFetchPlaylists = (options: CommonFetcherProps) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useInfiniteQuery({
    queryKey: ["playlists"],
    queryFn: async ({ pageParam }) => {
      const params = {
        limit: 20,
        pageParam,
      };

      if (service === "apple") {
        return appleDataFetcher.fetchPlaylists(params);
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchPlaylists(params);
      }
    },
    enabled: enabled && !options.lazy,
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    initialPageParam: 0,
  });
};

export const useFetchPlaylist = (
  options: CommonFetcherProps & PlaylistFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery({
    queryKey: ["playlists", { id: options.id }],
    queryFn: async () => {
      if (service === "apple") {
        return appleDataFetcher.fetchPlaylist(options.id, options.inLibrary);
      } else if (service === "spotify") {
        return spotifyDataFetcher.fetchPlaylist(options.id);
      }
    },
    enabled: enabled && !options.lazy,
  });
};

export const useFetchSearchResults = (
  options: CommonFetcherProps & SearchFetcherProps
) => {
  const { spotifyDataFetcher, appleDataFetcher, service, enabled } =
    useDataFetchers();

  return useQuery({
    queryKey: ["search", { query: options.query }],
    queryFn: async () => {
      if (service === "spotify") {
        return spotifyDataFetcher.fetchSearchResults(options.query);
      } else if (service === "apple") {
        return appleDataFetcher.fetchSearchResults(options.query);
      }
    },
    enabled: enabled && !options.lazy,
  });
};
