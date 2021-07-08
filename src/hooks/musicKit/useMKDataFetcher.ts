import { useCallback } from 'react';

import { useMusicKit } from 'hooks';
import queryString from 'query-string';
import * as ConversionUtils from 'utils/conversion';

type FetchAppleMusicApiArgs = {
  endpoint: string;
  params?: Record<string, string | number>;
  inLibrary?: boolean;
};

/** Connects to the Apple Music API to return data to the UI. */
const useMKDataFetcher = () => {
  const { music } = useMusicKit();

  const fetchAppleMusicApi = useCallback(
    async <TApiResponseType extends object>({
      endpoint,
      inLibrary = false,
      params = {},
    }: FetchAppleMusicApiArgs) => {
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
        throw new Error(error);
      }
    },
    [music.api]
  );

  const fetchAlbums = useCallback(async () => {
    const response = await fetchAppleMusicApi<AppleMusicApi.AlbumResponse>({
      endpoint: `/albums`,
      inLibrary: true,
      params: {
        limit: 100,
      },
    });

    if (response) {
      return response.data.map((item: AppleMusicApi.Album) =>
        ConversionUtils.convertAppleAlbum(item, 300)
      );
    }
  }, [fetchAppleMusicApi]);

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

  const fetchArtists = useCallback(async () => {
    const response = await fetchAppleMusicApi<AppleMusicApi.ArtistResponse>({
      endpoint: `/artists`,
      inLibrary: true,
    });

    return response.data.map(ConversionUtils.convertAppleArtist);
  }, [fetchAppleMusicApi]);

  const fetchArtistAlbums = useCallback(
    async (id: string, inLibrary = false) => {
      const response = await fetchAppleMusicApi<AppleMusicApi.AlbumResponse>({
        endpoint: `/artists/${id}/albums`,
        inLibrary,
      });

      return response.data.map((item: AppleMusicApi.Album) =>
        ConversionUtils.convertAppleAlbum(item)
      );
    },
    [fetchAppleMusicApi]
  );

  const fetchPlaylists = useCallback(async () => {
    const response = await fetchAppleMusicApi<AppleMusicApi.PlaylistResponse>({
      endpoint: '/playlists',
      params: {
        limit: 100,
      },
      inLibrary: true,
    });

    return response.data.map(ConversionUtils.convertApplePlaylist);
  }, [fetchAppleMusicApi]);

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

      return ConversionUtils.convertApplePlaylist(response.data[0]);
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
  };
};

export default useMKDataFetcher;
