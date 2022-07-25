import { useCallback } from 'react';

import { useMusicKit } from 'hooks';
import queryString from 'query-string';
import * as ConversionUtils from 'utils/conversion';

/**
 *  Accepts information about the current API request  as well as
 *  the response's total number of items. If the total is greater than the current offset,
 *  return the incremented pageParam.
 */
const getNextPageParam = ({
  limit,
  offset,
  prevPageParam,
  totalResults = 0,
}: {
  limit: number;
  offset: number;
  prevPageParam: number;
  totalResults?: number;
}) => {
  return offset >= totalResults - limit ? undefined : prevPageParam + 1;
};

type FetchAppleMusicApiArgs = {
  endpoint: string;
  params?: Record<string, string | number>;
  inLibrary?: boolean;
};

/** Connects to the Apple Music API to return data to the UI. */
const useMKDataFetcher = () => {
  const { music, isConfigured } = useMusicKit();

  const fetchAppleMusicApi = useCallback(
    async <TApiResponseType extends object>({
      endpoint,
      inLibrary = false,
      params = {},
    }: FetchAppleMusicApiArgs) => {
      if (!music || !isConfigured) {
        console.error(
          `MusicKit is not configured. Unable to fetch ${endpoint}.`
        );
        return;
      }

      const baseUrl = inLibrary
        ? `/v1/me/library/${endpoint}`
        : `/v1/catalog/{{storefrontId}}/${endpoint}`;
      const paramsString = queryString.stringify(params);

      const url = `${baseUrl}?${paramsString}`;

      try {
        // TODO: Update types for MusicKit V3
        const response = await (music.api as any).music(url);

        return response.data as TApiResponseType;
      } catch (error) {
        // TODO: Show a popup instead.
        console.error(error);
      }
    },
    [isConfigured, music]
  );

  const fetchAlbums = useCallback(
    async ({ pageParam, limit }: { pageParam: number; limit: number }) => {
      const offset = pageParam * limit;

      const response = await fetchAppleMusicApi<AppleMusicApi.AlbumResponse>({
        endpoint: `/albums`,
        inLibrary: true,
        params: {
          limit,
          offset,
        },
      });
      const nextPageParam = getNextPageParam({
        limit,
        offset,
        prevPageParam: pageParam,
        totalResults: response?.meta.total,
      });

      return {
        data:
          response?.data.map((item: AppleMusicApi.Album) =>
            ConversionUtils.convertAppleAlbum(item, 300)
          ) ?? [],
        nextPageParam,
      };
    },
    [fetchAppleMusicApi]
  );

  const fetchAlbum = useCallback(
    async (id: string, inLibrary = false) => {
      const response = await fetchAppleMusicApi<AppleMusicApi.AlbumResponse>({
        endpoint: `albums/${id}`,
        inLibrary,
      });

      if (response) {
        return ConversionUtils.convertAppleAlbum(response.data[0]);
      }
    },
    [fetchAppleMusicApi]
  );

  const fetchArtists = useCallback(
    async ({ limit, pageParam }: IpodApi.PaginationParams) => {
      const offset = pageParam * limit;

      const response = await fetchAppleMusicApi<AppleMusicApi.ArtistResponse>({
        endpoint: `/artists`,
        params: {
          limit,
          offset,
        },
        inLibrary: true,
      });
      const nextPageParam = getNextPageParam({
        limit,
        offset,
        prevPageParam: pageParam,
        totalResults: response?.meta.total,
      });

      const result: IpodApi.PaginatedResponse<IpodApi.Artist[]> = {
        data: response?.data.map(ConversionUtils.convertAppleArtist) ?? [],
        nextPageParam,
      };

      return result;
    },
    [fetchAppleMusicApi]
  );

  const fetchArtistAlbums = useCallback(
    async (id: string, inLibrary = false) => {
      const response = await fetchAppleMusicApi<AppleMusicApi.AlbumResponse>({
        endpoint: `/artists/${id}/albums`,
        inLibrary,
      });

      return response?.data.map((item: AppleMusicApi.Album) =>
        ConversionUtils.convertAppleAlbum(item)
      );
    },
    [fetchAppleMusicApi]
  );

  const fetchPlaylists = useCallback(
    async ({ limit, pageParam }: IpodApi.PaginationParams) => {
      const offset = pageParam * limit;

      const response = await fetchAppleMusicApi<AppleMusicApi.PlaylistResponse>(
        {
          endpoint: '/playlists',
          params: {
            limit: 50,
            offset,
          },
          inLibrary: true,
        }
      );
      const nextPageParam = getNextPageParam({
        limit,
        offset,
        prevPageParam: pageParam,
        totalResults: response?.meta.total,
      });

      const result: IpodApi.PaginatedResponse<IpodApi.Playlist[]> = {
        data: response?.data.map(ConversionUtils.convertApplePlaylist) ?? [],
        nextPageParam,
      };

      return result;
    },
    [fetchAppleMusicApi]
  );

  const fetchPlaylist = useCallback(
    async (playlistId: string, inLibrary = false) => {
      const response = await fetchAppleMusicApi<AppleMusicApi.PlaylistResponse>(
        {
          endpoint: `/playlists/${playlistId}`,
          params: {
            include: 'tracks',
          },
          inLibrary,
        }
      );

      if (!response) {
        return;
      }

      return ConversionUtils.convertApplePlaylist(response?.data[0]);
    },
    [fetchAppleMusicApi]
  );

  const fetchSearchResults = useCallback(
    async (query: string) => {
      const response = await fetchAppleMusicApi<AppleMusicApi.SearchResponse>({
        endpoint: `search`,
        params: {
          term: query,
          types: 'albums,artists,playlists,songs',
        },
      });

      if (!response) {
        return;
      }

      return ConversionUtils.convertAppleSearchResults(response);
    },
    [fetchAppleMusicApi]
  );

  return {
    fetchAlbums,
    fetchAlbum,
    fetchArtists,
    fetchArtistAlbums,
    fetchPlaylists,
    fetchPlaylist,
    fetchSearchResults,
  };
};

export default useMKDataFetcher;
