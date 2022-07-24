import { useCallback } from 'react';

import { useSpotifySDK } from 'hooks';
import { uniqBy } from 'lodash';
import * as ConversionUtils from 'utils/conversion';

type FetchSpotifyApiArgs = {
  endpoint: string;
  accessToken?: string;
  onError: (error: any) => void;
};

const fetchSpotifyApi = async <TSpotifyApiType extends object>({
  endpoint,
  accessToken,
  onError,
}: FetchSpotifyApiArgs) => {
  try {
    if (!accessToken) {
      throw new Error('Provide a Spotify API Access token');
    }

    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return (await res.json()) as TSpotifyApiType;
  } catch (error) {
    onError(error);
  }
};

const useSpotifyDataFetcher = () => {
  const { accessToken } = useSpotifySDK();

  const fetchAlbums = useCallback(async () => {
    const response = await fetchSpotifyApi<SpotifyApi.UsersSavedAlbumsResponse>(
      {
        endpoint: `me/albums?limit=50`,
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      }
    );

    if (response) {
      return response.items.map((item) =>
        ConversionUtils.convertSpotifyAlbumFull(item.album)
      );
    }
  }, [accessToken]);

  const fetchAlbum = useCallback(
    async (userId = '', id: string) => {
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

  const fetchArtists = useCallback(async () => {
    const response =
      await fetchSpotifyApi<SpotifyApi.UsersFollowedArtistsResponse>({
        endpoint: `me/following?type=artist&limit=50`,
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      });

    return response?.artists?.items.map(
      ConversionUtils.convertSpotifyArtistFull
    );
  }, [accessToken]);

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

  const fetchPlaylists = useCallback(async () => {
    const response =
      await fetchSpotifyApi<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
        endpoint: 'me/playlists?limit=50',
        accessToken,
        onError: (error) => {
          throw new Error(error);
        },
      });

    return response?.items?.map(
      ConversionUtils.convertSpotifyPlaylistSimplified
    );
  }, [accessToken]);

  const fetchPlaylist = useCallback(
    async (userId = '', id: string) => {
      const response = await fetchSpotifyApi<SpotifyApi.PlaylistObjectFull>({
        endpoint: `users/${userId}/playlists/${id}`,
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
        endpoint: `search?q=${query}&type=track%2Cartist%2Calbum%2Cplaylist&limit=15`,
        accessToken,
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
