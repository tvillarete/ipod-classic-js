import { useCallback, useMemo } from "react";
import { SelectableListOption } from "@/components/SelectableList";
import {
  useAudioPlayer,
  useSettings,
  useSpotifyDataFetcher,
  useMKDataFetcher,
} from "@/hooks";

export const useMediaOptions = () => {
  const { playNext, playLater } = useAudioPlayer();
  const { service } = useSettings();
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const appleDataFetcher = useMKDataFetcher();

  // Create a normalized data fetcher interface that works for both services
  const dataFetcher = useMemo(() => {
    switch (service) {
      case "spotify":
        return {
          fetchPlaylist: (id: string) => spotifyDataFetcher.fetchPlaylist(id),
          fetchAlbum: (id: string) => spotifyDataFetcher.fetchAlbum({ id }),
        };
      case "apple":
        return {
          fetchPlaylist: (id: string) =>
            appleDataFetcher.fetchPlaylist(id, false),
          fetchAlbum: (id: string) => appleDataFetcher.fetchAlbum(id, false),
        };
      default:
        // Fallback that will never be called in normal operation
        return {
          fetchPlaylist: () => Promise.resolve(undefined),
          fetchAlbum: () => Promise.resolve(undefined),
        };
    }
  }, [service, spotifyDataFetcher, appleDataFetcher]);

  /**
   * Fetches full media data (with songs) for albums and playlists if not already loaded.
   * Songs already have their data, so they're returned as-is.
   */
  const fetchFullMediaData = useCallback(
    async (
      type: "album" | "song" | "playlist",
      data: MediaApi.Album | MediaApi.Song | MediaApi.Playlist
    ): Promise<MediaApi.QueueOptions> => {
      const queueOptions: MediaApi.QueueOptions = {};

      switch (type) {
        case "playlist": {
          const playlist = data as MediaApi.Playlist;
          const areSongsLoaded = playlist.songs?.length > 0;
          queueOptions.playlist = areSongsLoaded
            ? playlist
            : await dataFetcher.fetchPlaylist(playlist.id);
          break;
        }
        case "album": {
          const album = data as MediaApi.Album;
          const areSongsLoaded = album.songs?.length > 0;
          queueOptions.album = areSongsLoaded
            ? album
            : await dataFetcher.fetchAlbum(album.id);
          break;
        }
        case "song":
          queueOptions.song = data as MediaApi.Song;
          break;
      }

      return queueOptions;
    },
    [dataFetcher]
  );

  const getMediaOptions = useCallback(
    (
      type: "album" | "song" | "playlist",
      data: MediaApi.Album | MediaApi.Song | MediaApi.Playlist
    ): SelectableListOption[] => {
      const handleQueueAction = async (
        action: (queueOptions: MediaApi.QueueOptions) => Promise<void>
      ) => {
        try {
          const queueOptions = await fetchFullMediaData(type, data);
          await action(queueOptions);
        } catch (error) {
          console.error("Failed to add to queue:", error);
          throw error;
        }
      };

      return [
        {
          type: "action",
          label: "Play Next",
          onSelect: () => handleQueueAction(playNext),
        },
        {
          type: "action",
          label: "Play Later",
          onSelect: () => handleQueueAction(playLater),
        },
      ];
    },
    [fetchFullMediaData, playLater, playNext]
  );

  return { getMediaOptions };
};

export default useMediaOptions;
