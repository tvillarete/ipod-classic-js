import { useCallback } from "react";

import { useSpotifySDK } from "@/hooks";
import * as ConversionUtils from "@/utils/conversion";
import { spotifyApi } from "@/utils/spotifyApi";

/**
 * Spotify errors out if you pass it a value of 0 for the `after` query param.
 * This function safely parses the `after` query param and returns `undefined` if it's 0.
 */
const safeParseAfter = (after: string | undefined) =>
  !after || after === "0" ? undefined : after;

const useSpotifyDataFetcher = () => {
  const { accessToken, refreshAccessToken } = useSpotifySDK();

  const fetchAlbums = useCallback(
    async ({ pageParam, limit }: MediaApi.PaginationParams) => {
      if (!accessToken) return;

      const offset = pageParam * limit;

      const response =
        await spotifyApi<SpotifyApi.UsersSavedAlbumsResponse>({
          endpoint: `me/albums`,
          params: { limit, offset },
          accessToken,
          onTokenExpired: refreshAccessToken,
        });

      const result: MediaApi.PaginatedResponse<MediaApi.Album[]> = {
        data:
          response.items.map((item) =>
            ConversionUtils.convertSpotifyAlbumFull(item.album)
          ) ?? [],
        nextPageParam: response.next ? pageParam + 1 : undefined,
      };

      return result;
    },
    [accessToken, refreshAccessToken]
  );

  const fetchAlbum = useCallback(
    async ({ id }: { id: string }) => {
      if (!accessToken) return;

      const response = await spotifyApi<SpotifyApi.SingleAlbumResponse>({
        endpoint: `albums/${id}`,
        accessToken,
        onTokenExpired: refreshAccessToken,
      });

      return ConversionUtils.convertSpotifyAlbumFull(response);
    },
    [accessToken, refreshAccessToken]
  );

  const fetchArtists = useCallback(
    async ({ limit, after }: MediaApi.PaginationParams) => {
      if (!accessToken) return;

      const response =
        await spotifyApi<SpotifyApi.UsersFollowedArtistsResponse>({
          endpoint: `me/following`,
          params: {
            type: "artist",
            limit,
            after: safeParseAfter(after),
          },
          accessToken,
          onTokenExpired: refreshAccessToken,
        });

      const data =
        response.artists?.items.map(
          ConversionUtils.convertSpotifyArtistFull
        ) ?? [];

      const result: MediaApi.PaginatedResponse<MediaApi.Artist[]> = {
        data,
        after: response.artists.next ? data[data.length - 1]?.id : undefined,
      };

      return result;
    },
    [accessToken, refreshAccessToken]
  );

  const fetchArtist = useCallback(
    async (id: string) => {
      if (!accessToken) return;

      const response = await spotifyApi<SpotifyApi.ArtistsAlbumsResponse>({
        endpoint: `artists/${id}/albums`,
        accessToken,
        onTokenExpired: refreshAccessToken,
      });

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
    },
    [accessToken, refreshAccessToken]
  );

  const fetchPlaylists = useCallback(
    async ({ pageParam, limit }: MediaApi.PaginationParams) => {
      if (!accessToken) return;

      const offset = pageParam * limit;

      const response =
        await spotifyApi<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
          endpoint: "me/playlists",
          params: { limit, offset },
          accessToken,
          onTokenExpired: refreshAccessToken,
        });

      const resultData = await Promise.all(
        response.items?.map(
          ConversionUtils.convertSpotifyPlaylistSimplified
        ) ?? []
      );

      const result: MediaApi.PaginatedResponse<MediaApi.Playlist[]> = {
        data: resultData,
        nextPageParam: response.next ? pageParam + 1 : undefined,
      };

      return result;
    },
    [accessToken, refreshAccessToken]
  );

  const fetchPlaylist = useCallback(
    async (id: string) => {
      if (!accessToken) return;

      const response = await spotifyApi<SpotifyApi.PlaylistObjectFull>({
        endpoint: `playlists/${id}`,
        accessToken,
        onTokenExpired: refreshAccessToken,
      });

      return ConversionUtils.convertSpotifyPlaylistFull(response);
    },
    [accessToken, refreshAccessToken]
  );

  const fetchSearchResults = useCallback(
    async (query: string) => {
      if (!accessToken) return;

      const response = await spotifyApi<SpotifyApi.SearchResponse>({
        endpoint: `search`,
        accessToken,
        params: {
          q: query,
          type: "track,artist,album,playlist",
          limit: 15,
        },
        onTokenExpired: refreshAccessToken,
      });

      return ConversionUtils.convertSpotifySearchResults(response);
    },
    [accessToken, refreshAccessToken]
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
