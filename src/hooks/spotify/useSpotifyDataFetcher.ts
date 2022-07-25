import { useCallback } from 'react';

import { useSpotifySDK } from 'hooks';
import { uniqBy } from 'lodash';
import * as ConversionUtils from 'utils/conversion';
import querystring from 'query-string';

type FetchSpotifyApiArgs = {
  endpoint: string;
  accessToken?: string;
  params?: Record<string, any>;
  onError: (error: any) => void;
};

const fetchSpotifyApi = async <TSpotifyApiType extends object>({
  endpoint,
  accessToken,
  params = {},
  onError,
}: FetchSpotifyApiArgs) => {
  try {
    if (!accessToken) {
      throw new Error('Provide a Spotify API Access token');
    }

    const queryParams = querystring.stringify(params);

    const res = await fetch(
      `https://api.spotify.com/v1/${endpoint}?${queryParams}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return (await res.json()) as TSpotifyApiType;
  } catch (error) {
    onError(error);
  }
};

const useSpotifyDataFetcher = () => {
  const { accessToken } = useSpotifySDK();

  const fetchAlbums = useCallback(
    async ({ pageParam, limit }: IpodApi.PaginationParams) => {
      const offset = pageParam * limit;

      const response =
        await fetchSpotifyApi<SpotifyApi.UsersSavedAlbumsResponse>({
          endpoint: `me/albums`,
          params: {
            limit,
            offset,
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      const result: IpodApi.PaginatedResponse<IpodApi.Album[]> = {
        data:
          response?.items.map((item) =>
            ConversionUtils.convertSpotifyAlbumFull(item.album)
          ) ?? [],
        nextPageParam: response?.next ? pageParam + 1 : undefined,
      };

      return result;
    },
    [accessToken]
  );

  const fetchAlbum = useCallback(
    async ({ id }: { id: string }) => {
      const response = await fetchSpotifyApi<SpotifyApi.SingleAlbumResponse>({
        endpoint: `albums/${id}`,
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      });

      if (response) {
        return ConversionUtils.convertSpotifyAlbumFull(response);
      }
    },
    [accessToken]
  );

  const fetchArtists = useCallback(
    async ({ limit, after }: IpodApi.PaginationParams) => {
      const response =
        await fetchSpotifyApi<SpotifyApi.UsersFollowedArtistsResponse>({
          endpoint: `me/following`,
          params: {
            type: 'artist',
            limit,
            after,
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      const data =
        response?.artists?.items.map(
          ConversionUtils.convertSpotifyArtistFull
        ) ?? [];

      const result: IpodApi.PaginatedResponse<IpodApi.Artist[]> = {
        data,
        after: response?.artists.next ? data[data.length - 1]?.id : undefined,
      };

      return result;
    },
    [accessToken]
  );

  const fetchArtist = useCallback(
    async (userId = '', id: string) => {
      const response = await fetchSpotifyApi<SpotifyApi.ArtistsAlbumsResponse>({
        endpoint: `artists/${id}/albums`,
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      });

      if (response) {
        return uniqBy(
          response.items.map(ConversionUtils.convertSpotifyAlbumSimplified),
          (item) => item.name
        );
      }
    },
    [accessToken]
  );

  const fetchPlaylists = useCallback(
    async ({ pageParam, limit }: IpodApi.PaginationParams) => {
      const offset = pageParam * limit;

      const response =
        await fetchSpotifyApi<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
          endpoint: 'me/playlists',
          params: {
            limit,
            offset,
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      const result: IpodApi.PaginatedResponse<IpodApi.Playlist[]> = {
        data:
          response?.items?.map(
            ConversionUtils.convertSpotifyPlaylistSimplified
          ) ?? [],
        nextPageParam: response?.next ? pageParam + 1 : undefined,
      };

      return result;
    },
    [accessToken]
  );

  const fetchPlaylist = useCallback(
    async (id: string) => {
      const response = await fetchSpotifyApi<SpotifyApi.PlaylistObjectFull>({
        endpoint: `playlists/${id}`,
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      });

      if (response) {
        return ConversionUtils.convertSpotifyPlaylistFull(response);
      }
    },
    [accessToken]
  );

  const fetchSearchResults = useCallback(
    async (query: string) => {
      const response = await fetchSpotifyApi<SpotifyApi.SearchResponse>({
        endpoint: `search`,
        accessToken,
        params: {
          q: query,
          type: 'track,artist,album,playlist',
          limit: 15,
        },
        onError: (error) => {
          throw new Error(error);
        },
      });

      if (response) {
        return ConversionUtils.convertSpotifySearchResults(response);
      }
    },
    [accessToken]
  );

  return {
    fetchAlbums,
    fetchAlbum,
    fetchArtists,
    fetchArtist,
    fetchPlaylists,
    fetchPlaylist,
    fetchSearchResults,
  };
};

export default useSpotifyDataFetcher;
