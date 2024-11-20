import { useCallback } from "react";

import { useSpotifySDK } from "hooks";
import * as ConversionUtils from "utils/conversion";
import querystring from "query-string";

/**
 * Spotify errors out if you pass it a value of 0 for the `after` query param.
 * This function safely parses the `after` query param and returns `undefined` if it's 0.
 */
const safeParseAfter = (after: string | undefined) =>
  !after || after === "0" ? undefined : after;

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
      throw new Error("Provide a Spotify API Access token");
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
    async ({ pageParam, limit }: MediaApi.PaginationParams) => {
      const offset = pageParam * limit;

      const response =
        await fetchSpotifyApi<SpotifyApi.UsersSavedAlbumsResponse>({
          endpoint: `me/albums`,
          params: {
            limit: 50,
            offset,
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      const result: MediaApi.PaginatedResponse<MediaApi.Album[]> = {
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
        params: {
          limit: 50
        },
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
    async ({ limit, after }: MediaApi.PaginationParams) => {

      const data: MediaApi.Artist[] = []

      let previousResponse =
        await fetchSpotifyApi<SpotifyApi.UsersFollowedArtistsResponse>({
          endpoint: `me/following`,
          params: {
            type: "artist",
            limit,
            after: safeParseAfter(after),
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      data.push.apply(data, previousResponse?.artists?.items.map(
        ConversionUtils.convertSpotifyArtistFull
      ) ?? []);

      while (previousResponse?.artists.next != null) {
        let nextResponse =
          await fetchSpotifyApi<SpotifyApi.UsersFollowedArtistsResponse>({
            endpoint: `me/following`,
            params: {
              type: "artist",
              limit,
              after: previousResponse?.artists.next ? data[data.length - 1]?.id : undefined,
            },
            accessToken,
            onError: (error) => {
              throw new Error(error);
            },
          });

        data.push.apply(data, nextResponse?.artists?.items.map(
          ConversionUtils.convertSpotifyArtistFull
        ) ?? []);

        previousResponse = nextResponse;
      }

      const result: MediaApi.PaginatedResponse<MediaApi.Artist[]> = {
        data,
        after: previousResponse?.artists.next ? data[data.length - 1]?.id : undefined,
      };

      return result;
    },
    [accessToken]
  );

  const fetchArtist = useCallback(
    async (id: string) => {
      const response = await fetchSpotifyApi<SpotifyApi.ArtistsAlbumsResponse>({
        endpoint: `artists/${id}/albums`,
        accessToken,
        params: {
          limit: 50,
        },
        onError: (error) => {
          throw new Error(error);
        },
      });

      if (response) {
        // Keep track of the artist's albums, to avoid showing duplicates
        const artistAlbums = new Set();
        return response.items
          .filter((album) => {
            if (artistAlbums.has(album.name)) {
              return false;
            }
            artistAlbums.add(album.name);
            return true;
          })
          .map(ConversionUtils.convertSpotifyAlbumSimplified);
      }
    },
    [accessToken]
  );

  const fetchPlaylists = useCallback(
    async ({ pageParam, limit }: MediaApi.PaginationParams) => {
      let playlistLimit = 20;
      let offset = 0;

      const data: MediaApi.Playlist[] = []

      let previousResponse =
        await fetchSpotifyApi<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
          endpoint: "me/playlists",
          params: {
            limit: playlistLimit,
            offset
          },
          accessToken,
          onError: (error) => {
            throw new Error(error);
          },
        });

      data.push.apply(data, await Promise.all(
        previousResponse?.items?.map(
          ConversionUtils.convertSpotifyPlaylistSimplified
        ) ?? []));

      if (previousResponse?.next != null) {
        offset += playlistLimit;

        let nextResponse =
          await fetchSpotifyApi<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
            endpoint: "me/playlists",
            params: {
              limit: playlistLimit,
              offset
            },
            accessToken,
            onError: (error) => {
              throw new Error(error);
            },
          });

        data.push.apply(data, await Promise.all(
          nextResponse?.items?.map(
            ConversionUtils.convertSpotifyPlaylistSimplified
          ) ?? []));

        previousResponse = nextResponse;
      }

      const result: MediaApi.PaginatedResponse<MediaApi.Playlist[]> = {
        data,
        nextPageParam: previousResponse?.next ? pageParam + 1 : undefined,
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
          type: "track,artist,album,playlist",
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
