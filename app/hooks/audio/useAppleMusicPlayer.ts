import { useCallback } from "react";
import { useMusicKit, useSettings } from "..";
import { MediaPlayerHook, PlaybackInfo } from "./types";

/**
 * Apple Music-specific media player implementation.
 * Implements the MediaPlayerHook interface for complete interchangeability.
 */
export const useAppleMusicPlayer = (): MediaPlayerHook => {
  const { music } = useMusicKit();
  const { isAppleAuthorized } = useSettings();

  const play = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      if (!isAppleAuthorized) {
        throw new Error("Unable to play: Not authorized");
      }

      // MusicKit JS V3 doesn't support passing a single playlist id to the queue.
      // Workaround: extract the song ids instead.
      const playlistSongs = queueOptions.playlist?.songs?.map(({ id }) => id);

      // When startPosition is provided with an album, MusicKit ignores it.
      // Workaround: pass the album's songs as individual song IDs.
      const albumSongs = queueOptions.album?.songs?.map((song) => song.id);

      // MusicKit JS V3 expects only a single media type with no empty keys.
      const queue: Partial<MusicKit.SetQueueOptions> = {};

      if (albumSongs) {
        queue.songs = albumSongs;
      } else if (queueOptions.album?.id) {
        queue.album = queueOptions.album.id;
      } else if (playlistSongs) {
        queue.songs = playlistSongs;
      } else if (queueOptions.songs) {
        queue.songs = queueOptions.songs.map((song) => song.url);
      } else if (queueOptions.song?.id) {
        queue.song = queueOptions.song.id;
      }

      await music.setQueue(queue);

      // Jump to the selected track if needed (MusicKit defaults to index 0)
      if (queueOptions.startPosition) {
        await music.changeToMediaAtIndex(queueOptions.startPosition);
      }

      // Only call play() if not already playing (changeToMediaAtIndex may auto-start playback)
      if (!music.isPlaying) {
        await music.play();
      }
    },
    [isAppleAuthorized, music]
  );

  const playNext = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      if (!isAppleAuthorized) {
        throw new Error("Unable to add to queue: Not authorized");
      }

      // Build queue data for Apple Music API
      const queueData: Record<string, string> = {};

      if (queueOptions.album) queueData.album = queueOptions.album.id;
      else if (queueOptions.playlist)
        queueData.playlist = queueOptions.playlist.id;
      else if (queueOptions.song) queueData.song = queueOptions.song.id;
      else if (queueOptions.songs?.[0])
        queueData.song = queueOptions.songs[0].id;

      await music.playNext(queueData);
    },
    [isAppleAuthorized, music]
  );

  const playLater = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      if (!isAppleAuthorized) {
        throw new Error("Unable to add to queue: Not authorized");
      }

      // Get the album, playlist, or song ID based on the queue options
      const queueData: Record<string, string> = {};
      if (queueOptions.album) {
        queueData.album = queueOptions.album.id;
      } else if (queueOptions.playlist) {
        queueData.playlist = queueOptions.playlist.id;
      } else if (queueOptions.song) {
        queueData.song = queueOptions.song.id;
      } else if (queueOptions.songs?.[0]) {
        queueData.song = queueOptions.songs[0].id;
      }

      await music.playLater(queueData);
    },
    [isAppleAuthorized, music]
  );

  const pause = useCallback(async () => {
    return music.pause();
  }, [music]);

  const stop = useCallback(async () => {
    return music.stop();
  }, [music]);

  const togglePlayPause = useCallback(async () => {
    if (music.isPlaying) {
      music.pause();
    } else {
      music.play();
    }
  }, [music]);

  const skipNext = useCallback(async () => {
    if (music.nowPlayingItem) {
      await music.skipToNextItem();
    }
  }, [music]);

  const skipPrevious = useCallback(async () => {
    if (music.nowPlayingItem) {
      await music.skipToPreviousItem();
    }
  }, [music]);

  const seekToTime = useCallback(
    async (time: number) => {
      await music.seekToTime(time);
    },
    [music]
  );

  const updatePlaybackInfo = useCallback(async (): Promise<PlaybackInfo> => {
    return {
      isPlaying: false, // Will be updated by playback state change handler
      isPaused: false,
      isLoading: false,
      currentTime: music.currentPlaybackTime,
      timeRemaining: music.currentPlaybackTimeRemaining,
      percent: music.currentPlaybackProgress * 100,
      duration: music.currentPlaybackDuration,
    };
  }, [music]);

  const setShuffleMode = useCallback(
    async (mode: string) => {
      music.shuffleMode =
        mode === "off"
          ? MusicKit.PlayerShuffleMode.off
          : MusicKit.PlayerShuffleMode.songs;
    },
    [music]
  );

  const setRepeatMode = useCallback(
    async (mode: string) => {
      const modeMap = {
        off: MusicKit.PlayerRepeatMode.none,
        one: MusicKit.PlayerRepeatMode.one,
        all: MusicKit.PlayerRepeatMode.all,
      } as const;
      music.repeatMode = modeMap[mode as keyof typeof modeMap];
    },
    [music]
  );

  const hasPreviousTrack = useCallback(async (): Promise<boolean> => {
    // Apple Music doesn't provide a direct way to check queue position in V3
    // As a safe fallback, we'll return true and let the skip previous behavior
    // handle restarting vs actually going to previous track based on time
    return true;
  }, []);

  /**
   * Restores playback state from Apple Music.
   * MusicKit maintains state on Apple's servers, so we can check if there's
   * an active nowPlayingItem when the app loads.
   */
  const restorePlaybackState = useCallback(async () => {
    if (!isAppleAuthorized || !music) {
      return { nowPlayingItem: null, playbackInfo: null };
    }

    try {
      const mkNowPlayingItem = music.nowPlayingItem;

      if (!mkNowPlayingItem) {
        return { nowPlayingItem: null, playbackInfo: null };
      }

      // Convert MusicKit item to MediaItem
      const nowPlayingItem: MediaApi.MediaItem = {
        id: mkNowPlayingItem.id,
        name: mkNowPlayingItem.title ?? "",
        url: mkNowPlayingItem.id,
        artwork: {
          url:
            mkNowPlayingItem.artwork?.url
              .replace("{w}", "300")
              .replace("{h}", "300") ?? "",
        },
        albumName: mkNowPlayingItem.albumName ?? "",
        artistName: mkNowPlayingItem.artistName ?? "",
        duration: music.currentPlaybackDuration,
        trackNumber: mkNowPlayingItem.trackNumber ?? 0,
      };

      // Get playback info
      const duration = music.currentPlaybackDuration;
      const currentTime = music.currentPlaybackTime;
      const playbackInfo: PlaybackInfo = {
        isPlaying: music.isPlaying,
        isPaused: !music.isPlaying,
        isLoading: false,
        currentTime,
        timeRemaining: duration - currentTime,
        percent: duration > 0 ? (currentTime / duration) * 100 : 0,
        duration,
      };

      return { nowPlayingItem, playbackInfo };
    } catch (error) {
      console.error(
        "[useAppleMusicPlayer] Error restoring playback state:",
        error
      );
      return { nowPlayingItem: null, playbackInfo: null };
    }
  }, [isAppleAuthorized, music]);

  /**
   * Loads a track at a specific position and pauses it (for state restoration).
   * Note: Volume should be handled by the orchestrator (useAudioPlayer).
   */
  const loadTrackPaused = useCallback(
    async (mediaItem: string | MediaApi.MediaItem, positionSeconds: number) => {
      // Type guard - Apple Music only works with MediaItem objects
      if (typeof mediaItem === "string") {
        throw new Error(
          "Apple Music requires a MediaItem object, not a URI string"
        );
      }

      // Load and play the track
      await play({ song: mediaItem });

      // Seek to the position
      await seekToTime(positionSeconds);

      // Pause it
      await pause();
    },
    [play, seekToTime, pause]
  );

  const setupEventListeners = useCallback(
    (callbacks: {
      onPlaybackStateChange?: () => void;
      onQueueChange?: () => void;
    }) => {
      // Apple Music event listeners are handled via useMKEventListener hook
      // in the parent component, so this is a no-op for Apple Music.
      // Return undefined (no cleanup needed)
      return undefined;
    },
    []
  );

  return {
    play,
    playNext,
    playLater,
    pause,
    stop,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekToTime,
    updatePlaybackInfo,
    setShuffleMode,
    setRepeatMode,
    hasPreviousTrack,
    restorePlaybackState,
    loadTrackPaused,
    setupEventListeners,
  };
};
