import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  useMKDataFetcher,
  useMusicKit,
  useSettings,
  useSpotifyDataFetcher,
} from "@/hooks";

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

const STALE_TIME = {
  library: 5 * 60 * 1000,
  detail: 10 * 60 * 1000,
  search: 60 * 1000,
} as const;

export interface DataFetcher {
  fetchAlbums: (
    params: MediaApi.PaginationParams
  ) => Promise<MediaApi.PaginatedResponse<MediaApi.Album[]> | undefined>;
  fetchAlbum: (
    id: string,
    inLibrary?: boolean
  ) => Promise<MediaApi.Album | undefined>;
  fetchArtists: (
    params: MediaApi.PaginationParams
  ) => Promise<MediaApi.PaginatedResponse<MediaApi.Artist[]> | undefined>;
  fetchArtistAlbums: (
    id: string,
    inLibrary?: boolean
  ) => Promise<MediaApi.Album[] | undefined>;
  fetchPlaylists: (
    params: MediaApi.PaginationParams
  ) => Promise<MediaApi.PaginatedResponse<MediaApi.Playlist[]> | undefined>;
  fetchPlaylist: (
    id: string,
    inLibrary?: boolean
  ) => Promise<MediaApi.Playlist | undefined>;
  fetchSearchResults: (
    query: string
  ) => Promise<MediaApi.SearchResults | undefined>;
}

const useResolvedFetcher = () => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const appleDataFetcher = useMKDataFetcher();
  const { service, isAppleAuthorized, isSpotifyAuthorized } = useSettings();
  const { isConfigured } = useMusicKit();

  const enabled =
    (service === "apple" && isAppleAuthorized && isConfigured) ||
    (service === "spotify" && isSpotifyAuthorized);

  const fetcher: DataFetcher =
    service === "spotify" ? spotifyDataFetcher : appleDataFetcher;

  return { fetcher, service, enabled };
};

export const useFetchAlbum = (
  options: CommonFetcherProps & AlbumFetcherProps
) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useQuery({
    queryKey: [service, "album", { id: options.id }],
    queryFn: () => fetcher.fetchAlbum(options.id, options.inLibrary),
    staleTime: STALE_TIME.detail,
    enabled: enabled && !options.lazy,
  });
};

export const useFetchAlbums = (
  options: CommonFetcherProps & AlbumsFetcherProps
) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useInfiniteQuery({
    queryKey: [service, "albums"],
    queryFn: ({ pageParam }) =>
      fetcher.fetchAlbums({ pageParam, limit: 50 }),
    staleTime: STALE_TIME.library,
    enabled: enabled && !options.lazy,
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    initialPageParam: 0 as number | string,
  });
};

export const useFetchArtists = (options: CommonFetcherProps) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useInfiniteQuery({
    queryKey: [service, "artists"],
    queryFn: ({ pageParam }) =>
      fetcher.fetchArtists({ pageParam, limit: 20 }),
    staleTime: STALE_TIME.library,
    enabled: enabled && !options.lazy,
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    initialPageParam: 0 as number | string,
  });
};

export const useFetchArtistAlbums = (
  options: CommonFetcherProps & ArtistFetcherProps
) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useQuery({
    queryKey: [service, "artistAlbums", { id: options.id }],
    queryFn: () => fetcher.fetchArtistAlbums(options.id, options.inLibrary),
    staleTime: STALE_TIME.detail,
    enabled: enabled && !options.lazy,
  });
};

export const useFetchPlaylists = (options: CommonFetcherProps) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useInfiniteQuery({
    queryKey: [service, "playlists"],
    queryFn: ({ pageParam }) =>
      fetcher.fetchPlaylists({ pageParam, limit: 20 }),
    staleTime: STALE_TIME.library,
    enabled: enabled && !options.lazy,
    getNextPageParam: (lastPage) => lastPage?.nextPageParam,
    initialPageParam: 0 as number | string,
  });
};

export const useFetchPlaylist = (
  options: CommonFetcherProps & PlaylistFetcherProps
) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useQuery({
    queryKey: [service, "playlist", { id: options.id }],
    queryFn: () => fetcher.fetchPlaylist(options.id, options.inLibrary),
    staleTime: STALE_TIME.detail,
    enabled: enabled && !options.lazy,
  });
};

export const useFetchSearchResults = (
  options: CommonFetcherProps & SearchFetcherProps
) => {
  const { fetcher, service, enabled } = useResolvedFetcher();

  return useQuery({
    queryKey: [service, "search", { query: options.query }],
    queryFn: () => fetcher.fetchSearchResults(options.query),
    staleTime: STALE_TIME.search,
    enabled: enabled && !options.lazy,
  });
};
