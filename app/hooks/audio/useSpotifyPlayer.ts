import { useCallback } from "react";
import { useSpotifySDK, useSettings } from "..";
import * as SpotifyUtils from "@/utils/spotify";
import { sleep } from "@/utils";
import { MediaPlayerHook, PlaybackInfo } from "./types";

/**
 * Delay needed for Spotify Web Playback SDK to register play commands before pausing.
 * Without this delay, pause commands may be ignored or cause race conditions.
 */
const SPOTIFY_PLAYBACK_SETTLE_DELAY_MS = 500;
const SPOTIFY_PLAYBACK_PAUSE_SETTLE_DELAY_MS = 1000;

/**
 * Spotify-specific media player implementation.
 * Implements the MediaPlayerHook interface for complete interchangeability.
 */
export const useSpotifyPlayer = (): MediaPlayerHook => {
  const { spotifyPlayer, accessToken, deviceId } = useSpotifySDK();
  const { isSpotifyAuthorized, shuffleMode } = useSettings();

  /**
   * Adds a single track to the Spotify queue.
   */
  const addTrackToSpotifyQueue = useCallback(
    async (uri: string) => {
      if (!deviceId) {
        throw new Error("No Spotify device ID available");
      }

      const url = SpotifyUtils.buildSpotifyPlayerUrl("queue", {
        uri,
        device_id: deviceId,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(`Spotify queue API error: ${errorMessage}`);
      }
    },
    [accessToken, deviceId]
  );

  const updateSpotifyPlayerState = useCallback(
    async (endpoint: string) => {
      const url = SpotifyUtils.buildSpotifyPlayerUrl(endpoint);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }
    },
    [accessToken]
  );

  const play = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      const uris = SpotifyUtils.extractSpotifyUris(queueOptions);

      if (uris.length === 0) {
        throw new Error("No URIs found to play");
      }

      if (!deviceId) {
        throw new Error("No Spotify device ID available");
      }

      const url = SpotifyUtils.buildSpotifyPlayerUrl("play", {
        device_id: deviceId,
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ uris }),
      });

      if (!response.ok) {
        throw new Error(`Spotify play API error: ${response.status}`);
      }
    },
    [accessToken, deviceId]
  );

  const playNext = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      const uris = SpotifyUtils.extractSpotifyUris(queueOptions);

      if (uris.length === 0) {
        throw new Error("No URIs found to add to queue");
      }

      // Save current shuffle state
      const wasShuffleEnabled = shuffleMode === "songs";

      try {
        // Disable shuffle to ensure tracks play in order
        if (wasShuffleEnabled) {
          await updateSpotifyPlayerState(
            `shuffle?state=false&device_id=${deviceId}`
          );
        }

        // Add tracks in reverse order (last track first)
        // This is necessary because Spotify's queue API always adds to the end,
        // so we reverse to get them to play in the correct order as "next" tracks
        const reversedUris = [...uris].reverse();
        for (const uri of reversedUris) {
          await addTrackToSpotifyQueue(uri);
        }
      } finally {
        // Re-enable shuffle if it was on
        if (wasShuffleEnabled) {
          await updateSpotifyPlayerState(
            `shuffle?state=true&device_id=${deviceId}`
          );
        }
      }
    },
    [addTrackToSpotifyQueue, deviceId, shuffleMode, updateSpotifyPlayerState]
  );

  const playLater = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      const uris = SpotifyUtils.extractSpotifyUris(queueOptions);

      if (uris.length === 0) {
        throw new Error("No URIs found to add to queue");
      }

      // Add tracks in normal order
      for (const uri of uris) {
        await addTrackToSpotifyQueue(uri);
      }
    },
    [addTrackToSpotifyQueue]
  );

  const pause = useCallback(async () => {
    await updateSpotifyPlayerState("pause");
  }, [updateSpotifyPlayerState]);

  const stop = useCallback(async () => {
    await spotifyPlayer?.pause();
  }, [spotifyPlayer]);

  const togglePlayPause = useCallback(async () => {
    await spotifyPlayer?.togglePlay();
  }, [spotifyPlayer]);

  const skipNext = useCallback(async () => {
    await spotifyPlayer?.nextTrack();
  }, [spotifyPlayer]);

  const skipPrevious = useCallback(async () => {
    await spotifyPlayer?.previousTrack();
  }, [spotifyPlayer]);

  const seekToTime = useCallback(
    async (time: number) => {
      await spotifyPlayer?.seek(time * 1000);
    },
    [spotifyPlayer]
  );

  const updatePlaybackInfo = useCallback(async (): Promise<PlaybackInfo> => {
    const state = await spotifyPlayer?.getCurrentState();

    if (!state) {
      return {
        isPlaying: false,
        isPaused: true,
        isLoading: false,
        currentTime: 0,
        timeRemaining: 0,
        percent: 0,
        duration: 0,
      };
    }

    const duration = state.duration / 1000;
    const currentTime = state.position / 1000;

    return {
      isPlaying: !state.paused,
      isPaused: state.paused,
      isLoading: false,
      currentTime,
      timeRemaining: duration - currentTime,
      percent: duration > 0 ? (currentTime / duration) * 100 : 0,
      duration,
    };
  }, [spotifyPlayer]);

  const setShuffleMode = useCallback(
    async (mode: string) => {
      const state = mode === "songs" ? "true" : "false";
      await updateSpotifyPlayerState(
        `shuffle?state=${state}&device_id=${deviceId}`
      );
    },
    [deviceId, updateSpotifyPlayerState]
  );

  const setRepeatMode = useCallback(
    async (mode: string) => {
      const stateMap = { off: "off", one: "track", all: "context" } as const;
      await updateSpotifyPlayerState(
        `repeat?state=${stateMap[mode as keyof typeof stateMap]}&device_id=${deviceId}`
      );
    },
    [deviceId, updateSpotifyPlayerState]
  );

  const hasPreviousTrack = useCallback(async (): Promise<boolean> => {
    const state = await spotifyPlayer?.getCurrentState();
    return (state?.track_window?.previous_tracks?.length ?? 0) > 0;
  }, [spotifyPlayer]);

  /**
   * Restores playback state from Spotify's servers.
   * This is necessary because the Web Playback SDK doesn't persist state across page reloads.
   */
  const restorePlaybackState = useCallback(async () => {
    if (!isSpotifyAuthorized || !accessToken) {
      return { nowPlayingItem: null, playbackInfo: null };
    }

    try {
      // Fetch current playback from Spotify's servers
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 204 No Content means no active playback
      if (response.status === 204) {
        return { nowPlayingItem: null, playbackInfo: null };
      }

      if (!response.ok) {
        return { nowPlayingItem: null, playbackInfo: null };
      }

      const currentPlayback: SpotifyApi.CurrentPlaybackResponse =
        await response.json();

      // If nothing is playing or it's not a track, return null
      if (
        !currentPlayback?.item ||
        currentPlayback.currently_playing_type !== "track"
      ) {
        return { nowPlayingItem: null, playbackInfo: null };
      }

      // Type guard: we know it's a track now
      const track = currentPlayback.item as SpotifyApi.TrackObjectFull;

      // Convert Spotify track to MediaItem
      const nowPlayingItem: MediaApi.MediaItem = {
        id: track.id,
        name: track.name,
        url: track.uri,
        artwork: {
          url: track.album.images[0]?.url ?? "",
        },
        albumName: track.album.name,
        artistName: track.artists.map((artist) => artist.name).join(", "),
        duration: track.duration_ms / 1000,
        trackNumber: track.track_number,
      };

      // Convert playback state to PlaybackInfo
      const duration = track.duration_ms / 1000;
      const currentTime = (currentPlayback.progress_ms ?? 0) / 1000;
      const playbackInfo: PlaybackInfo = {
        isPlaying: currentPlayback.is_playing,
        isPaused: !currentPlayback.is_playing,
        isLoading: false,
        currentTime,
        timeRemaining: duration - currentTime,
        percent: duration > 0 ? (currentTime / duration) * 100 : 0,
        duration,
      };

      return { nowPlayingItem, playbackInfo };
    } catch (error) {
      console.error(
        "[useSpotifyPlayer] Error restoring playback state:",
        error
      );
      return { nowPlayingItem: null, playbackInfo: null };
    }
  }, [isSpotifyAuthorized, accessToken]);

  /**
   * Loads a track at a specific position and pauses it (for state restoration).
   * Note: Volume should be handled by the orchestrator (useAudioPlayer).
   */
  const loadTrackPaused = useCallback(
    async (
      trackUriOrMediaItem: string | MediaApi.MediaItem,
      positionMs: number
    ) => {
      // Type guard - Spotify only works with URI strings
      const trackUri =
        typeof trackUriOrMediaItem === "string"
          ? trackUriOrMediaItem
          : trackUriOrMediaItem.url;

      if (!deviceId || !accessToken) {
        throw new Error("No device ID or access token available");
      }

      if (!spotifyPlayer) {
        throw new Error("Spotify player not initialized");
      }

      // Start playback at the specified position
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            uris: [trackUri],
            position_ms: positionMs,
          }),
        }
      );

      // Wait for Spotify to register the play command before pausing
      await sleep(SPOTIFY_PLAYBACK_SETTLE_DELAY_MS);

      // Pause it immediately
      await fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Wait a bit after pausing to ensure the player is fully paused before returning
      await sleep(SPOTIFY_PLAYBACK_PAUSE_SETTLE_DELAY_MS);
    },
    [deviceId, accessToken, spotifyPlayer]
  );

  const setupEventListeners = useCallback(
    (callbacks: {
      onPlaybackStateChange?: () => void;
      onQueueChange?: () => void;
    }) => {
      if (!spotifyPlayer || !callbacks.onPlaybackStateChange) {
        return;
      }

      const handler = (state: Spotify.PlaybackState | null) => {
        if (state && callbacks.onPlaybackStateChange) {
          callbacks.onPlaybackStateChange();
        }
      };

      spotifyPlayer.addListener("player_state_changed", handler);

      // Return cleanup function
      return () => {
        spotifyPlayer.removeListener("player_state_changed", handler);
      };
    },
    [spotifyPlayer]
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
