import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  useEventListener,
  useMKEventListener,
  useHapticFeedback,
} from "@/hooks";
import * as ConversionUtils from "@/utils/conversion";

import {
  useMusicKit,
  useSettings,
  useSpotifySDK,
  VOLUME_KEY,
  ShuffleMode,
  RepeatMode,
} from "..";
import { IpodEvent } from "@/utils/events";
import { useSpotifyPlayer } from "./useSpotifyPlayer";
import { useAppleMusicPlayer } from "./useAppleMusicPlayer";

const PLAYBACK_STATE_KEY = "playback_state";
const SAVED_STATE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const RESTORATION_SETTLE_DELAY_MS = 1000; // Delay before re-enabling event listeners after restoration
const SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS = 3; // Restart track if more than 3 seconds in

interface SavedPlaybackState {
  service: "spotify" | "apple";
  nowPlayingItem: MediaApi.MediaItem;
  currentTime: number;
  isPlaying: boolean;
  timestamp: number; // When this was saved
}

const defaultPlaybackInfoState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  timeRemaining: 0,
  percent: 0,
  duration: 0,
};

interface AudioPlayerState {
  playbackInfo: typeof defaultPlaybackInfoState;
  nowPlayingItem?: MediaApi.MediaItem;
  volume: number;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  play: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  playNext: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  playLater: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  pause: () => Promise<void>;
  seekToTime: (time: number) => Promise<void>;
  setVolume: (volume: number) => void;
  setShuffleMode: (mode: ShuffleMode) => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  updateNowPlayingItem: () => Promise<void>;
  updatePlaybackInfo: () => Promise<void>;
  reset: () => Promise<void>;
}

// Context initialized with empty object - actual value provided by AudioPlayerProvider
export const AudioPlayerContext = createContext<AudioPlayerState>(
  {} as AudioPlayerState
);

type AudioPlayerHook = AudioPlayerState;

export const useAudioPlayer = (): AudioPlayerHook => {
  const state = useContext(AudioPlayerContext);

  return state;
};

interface Props {
  children: React.ReactNode;
}

export const AudioPlayerProvider = ({ children }: Props) => {
  const {
    service,
    isSpotifyAuthorized,
    isAppleAuthorized,
    shuffleMode,
    repeatMode,
    setShuffleMode: updateShuffleModeSetting,
    setRepeatMode: updateRepeatModeSetting,
  } = useSettings();
  const { spotifyPlayer, accessToken, deviceId } = useSpotifySDK();
  const { music } = useMusicKit();
  const [volume, setVolume] = useState(0.5);
  const [nowPlayingItem, setNowPlayingItem] = useState<MediaApi.MediaItem>();
  const [playbackInfo, setPlaybackInfo] = useState(defaultPlaybackInfoState);
  const hasRestoredSpotifyStateRef = useRef(false);
  const hasRestoredAppleMusicStateRef = useRef(false);
  const isRestoringStateRef = useRef(false); // Flag to prevent event listeners from updating during restoration

  const hasNowPlayingItem = !!nowPlayingItem;

  const spotifyPlayerHook = useSpotifyPlayer();
  const applePlayerHook = useAppleMusicPlayer();

  // Select the active player based on current service
  const activePlayer = useMemo(() => {
    return service === "spotify" ? spotifyPlayerHook : applePlayerHook;
  }, [service, spotifyPlayerHook, applePlayerHook]);

  const play = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      setPlaybackInfo((prevState) => ({
        ...prevState,
        isLoading: true,
      }));

      try {
        await activePlayer.play(queueOptions);
      } finally {
        setPlaybackInfo((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      }
    },
    [activePlayer]
  );

  const playNext = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      await activePlayer.playNext(queueOptions);
    },
    [activePlayer]
  );

  const playLater = useCallback(
    async (queueOptions: MediaApi.QueueOptions) => {
      await activePlayer.playLater(queueOptions);
    },
    [activePlayer]
  );

  const pause = useCallback(async () => {
    await activePlayer.pause();
  }, [activePlayer]);

  const togglePlayPause = useCallback(async () => {
    if (!hasNowPlayingItem) {
      return;
    }
    await activePlayer.togglePlayPause();
  }, [activePlayer, hasNowPlayingItem]);

  const skipNext = useCallback(async () => {
    if (!nowPlayingItem) {
      return;
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    await activePlayer.skipNext();

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  }, [activePlayer, nowPlayingItem]);

  const skipPrevious = useCallback(async () => {
    if (!nowPlayingItem) {
      return;
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    // Check if there's a previous track available
    const hasPrevious = await activePlayer.hasPreviousTrack();

    // If we're on the first song OR more than 3 seconds into any song, restart it
    if (
      !hasPrevious ||
      playbackInfo.currentTime > SKIP_PREVIOUS_RESTART_THRESHOLD_SECONDS
    ) {
      await activePlayer.seekToTime(0);
    } else {
      await activePlayer.skipPrevious();
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  }, [activePlayer, nowPlayingItem, playbackInfo.currentTime]);

  const updateNowPlayingItem = useCallback(async () => {
    let mediaItem: MediaApi.MediaItem | undefined;

    if (service === "apple" && music.nowPlayingItem) {
      mediaItem = ConversionUtils.convertAppleMediaItem(music.nowPlayingItem);
    } else if (service === "spotify") {
      const state = await spotifyPlayer?.getCurrentState();

      if (state) {
        mediaItem = ConversionUtils.convertSpotifyMediaItem(state);
      }
    }

    setNowPlayingItem(mediaItem);
  }, [music, service, spotifyPlayer]);

  const handleApplePlaybackStateChange = useCallback(
    ({ state }: { state: MusicKit.PlaybackStates }) => {
      if (isRestoringStateRef.current) {
        return;
      }

      let isLoading = false;
      let isPlaying = false;
      let isPaused = false;

      switch (state) {
        case MusicKit.PlaybackStates.playing:
          isPlaying = true;
          break;
        case MusicKit.PlaybackStates.paused:
          isPaused = true;
          break;
        case MusicKit.PlaybackStates.loading:
        case MusicKit.PlaybackStates.waiting:
        case MusicKit.PlaybackStates.stalled:
          isLoading = true;
          break;
      }

      setPlaybackInfo((prevState) => ({
        ...prevState,
        isPlaying,
        isPaused,
        isLoading,
      }));

      updateNowPlayingItem();
    },
    [updateNowPlayingItem]
  );

  const handleSpotifyPlaybackStateChange = useCallback(
    (state?: Spotify.PlaybackState) => {
      if (!state || isRestoringStateRef.current) {
        return;
      }

      setPlaybackInfo((prevState) => ({
        ...prevState,
        isPlaying: !state.paused,
        isPaused: state.paused,
        isLoading: false,
      }));

      updateNowPlayingItem();
    },
    [updateNowPlayingItem]
  );

  const updatePlaybackInfo = useCallback(async () => {
    const info = await activePlayer.updatePlaybackInfo();

    setPlaybackInfo((prevState) => ({
      ...prevState,
      currentTime: info.currentTime,
      timeRemaining: info.timeRemaining,
      percent: info.percent,
      duration: info.duration,
    }));
  }, [activePlayer]);

  // Save playback state to localStorage
  const savePlaybackState = useCallback(() => {
    if (!nowPlayingItem || !service) {
      return;
    }

    const state: SavedPlaybackState = {
      service: service as "spotify" | "apple",
      nowPlayingItem,
      currentTime: playbackInfo.currentTime,
      isPlaying: false, // Always save as paused to prevent auto-play on reload
      timestamp: Date.now(),
    };

    localStorage.setItem(PLAYBACK_STATE_KEY, JSON.stringify(state));
  }, [nowPlayingItem, service, playbackInfo.currentTime]);

  // Restore playback state from localStorage
  const restoreFromLocalStorage = useCallback(async () => {
    const savedState = localStorage.getItem(PLAYBACK_STATE_KEY);
    if (!savedState) {
      return;
    }

    try {
      const state: SavedPlaybackState = JSON.parse(savedState);

      // Only restore if it's for the current service and less than 1 hour old
      if (
        state.service !== service ||
        Date.now() - state.timestamp > SAVED_STATE_EXPIRY_MS
      ) {
        return;
      }

      // Set flag to ignore event updates during restoration
      isRestoringStateRef.current = true;

      // Check that player is ready before attempting to load
      if (
        service === "spotify" &&
        (!spotifyPlayer || !accessToken || !deviceId)
      ) {
        isRestoringStateRef.current = false;
        return;
      }

      if (service === "apple" && !music) {
        isRestoringStateRef.current = false;
        return;
      }

      // Load the track in a paused state using the service-specific hook
      // For Spotify: pass URI string and position in MS
      // For Apple Music: pass full MediaItem and position in seconds
      if (service === "spotify") {
        await activePlayer.loadTrackPaused(
          state.nowPlayingItem.url,
          Math.floor(state.currentTime * 1000)
        );
      } else {
        await activePlayer.loadTrackPaused(
          state.nowPlayingItem,
          state.currentTime
        );
      }

      // Set the UI state
      setNowPlayingItem(state.nowPlayingItem);
      setPlaybackInfo((prev) => ({
        ...prev,
        currentTime: state.currentTime,
        duration: state.nowPlayingItem.duration ?? 0,
        isPlaying: false,
        isPaused: true,
        isLoading: false,
      }));

      // Re-enable event updates after a short delay
      setTimeout(() => {
        isRestoringStateRef.current = false;
      }, RESTORATION_SETTLE_DELAY_MS);
    } catch (error) {
      console.error("[AudioPlayer] Error restoring from localStorage:", error);
      isRestoringStateRef.current = false;
    }
  }, [service, spotifyPlayer, music, accessToken, deviceId, activePlayer]);

  const seekToTime = useCallback(
    async (time: number) => {
      await activePlayer.seekToTime(time);
      await updatePlaybackInfo();
    },
    [activePlayer, updatePlaybackInfo]
  );

  const handleChangeVolume = useCallback(
    (newVolume: number) => {
      if (isSpotifyAuthorized) {
        spotifyPlayer?.setVolume(newVolume);
      }

      if (isAppleAuthorized) {
        music.volume = newVolume;
      }

      localStorage.setItem(VOLUME_KEY, `${newVolume}`);

      setVolume(newVolume);
    },
    [isAppleAuthorized, isSpotifyAuthorized, music, spotifyPlayer]
  );

  /**
   * Handles state restoration for a specific service.
   * Both services use localStorage since MusicKit JS doesn't persist across browser reloads.
   * Mutes volume during restoration to prevent audio blips.
   */
  const handleServiceReady = useCallback(
    async (
      serviceName: "spotify" | "apple",
      hasRestoredRef: React.MutableRefObject<boolean>
    ) => {
      if (hasRestoredRef.current || service !== serviceName) {
        return;
      }

      // Save current volume and mute during restoration
      const previousVolume = volume;
      handleChangeVolume(0);

      try {
        await restoreFromLocalStorage();
      } catch (error) {
        console.error("[AudioPlayer] Error during service restoration:", error);
      } finally {
        console.log("HERE");
        // Always restore volume, even if restoration fails
        handleChangeVolume(previousVolume);
        hasRestoredRef.current = true;
      }
    },
    [service, volume, handleChangeVolume, restoreFromLocalStorage]
  );

  const reset = useCallback(async () => {
    // Stop any current playback
    await activePlayer.stop();

    // Reset all state
    setNowPlayingItem(undefined);
    setPlaybackInfo(defaultPlaybackInfoState);
  }, [activePlayer]);

  const handleSetShuffleMode = useCallback(
    async (mode: ShuffleMode) => {
      updateShuffleModeSetting(mode);
      await activePlayer.setShuffleMode(mode);
    },
    [activePlayer, updateShuffleModeSetting]
  );

  const handleSetRepeatMode = useCallback(
    async (mode: RepeatMode) => {
      updateRepeatModeSetting(mode);
      await activePlayer.setRepeatMode(mode);
    },
    [activePlayer, updateRepeatModeSetting]
  );

  const { triggerHaptics } = useHapticFeedback();

  const handlePlayPauseClick = useCallback(() => {
    triggerHaptics();
    togglePlayPause();
  }, [togglePlayPause, triggerHaptics]);

  const handleSkipNext = useCallback(() => {
    triggerHaptics();
    skipNext();
  }, [skipNext, triggerHaptics]);

  const handleSkipPrevious = useCallback(() => {
    triggerHaptics();
    skipPrevious();
  }, [skipPrevious, triggerHaptics]);

  useEventListener<IpodEvent>("playpauseclick", handlePlayPauseClick);
  useEventListener<IpodEvent>("forwardclick", handleSkipNext);
  useEventListener<IpodEvent>("backwardclick", handleSkipPrevious);

  // Handle state restoration when services are ready
  const handleSpotifyReady = useCallback(() => {
    handleServiceReady("spotify", hasRestoredSpotifyStateRef);
  }, [handleServiceReady]);

  const handleAppleMusicReady = useCallback(() => {
    handleServiceReady("apple", hasRestoredAppleMusicStateRef);
  }, [handleServiceReady]);

  useEventListener<IpodEvent>("spotify-ready", handleSpotifyReady);
  useEventListener<IpodEvent>("apple-music-ready", handleAppleMusicReady);

  // Apple playback event listeners
  useMKEventListener("playbackStateDidChange", handleApplePlaybackStateChange);
  useMKEventListener("queuePositionDidChange", updateNowPlayingItem);

  // Set up Spotify event listeners for ongoing playback updates
  useEffect(() => {
    if (!isSpotifyAuthorized || !spotifyPlayer) {
      return;
    }

    spotifyPlayer.addListener(
      "player_state_changed",
      handleSpotifyPlaybackStateChange
    );

    return () => {
      spotifyPlayer.removeListener(
        "player_state_changed",
        handleSpotifyPlaybackStateChange
      );
    };
  }, [handleSpotifyPlaybackStateChange, isSpotifyAuthorized, spotifyPlayer]);

  // Save playback state periodically and on unmount
  useEffect(() => {
    // Save every 5 seconds while playing
    const interval = setInterval(() => {
      if (playbackInfo.isPlaying) {
        savePlaybackState();
      }
    }, 5000);

    // Save on unmount (page close/reload)
    const handleBeforeUnload = () => {
      savePlaybackState();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      savePlaybackState(); // Save one last time
    };
  }, [savePlaybackState, playbackInfo.isPlaying]);

  // Initialize volume when either service is authorized
  useEffect(() => {
    if (isAppleAuthorized || isSpotifyAuthorized) {
      const savedVolume = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.5");
      handleChangeVolume(savedVolume);
    }
  }, [handleChangeVolume, isAppleAuthorized, isSpotifyAuthorized]);

  return (
    <AudioPlayerContext.Provider
      value={{
        playbackInfo,
        nowPlayingItem,
        volume,
        shuffleMode,
        repeatMode,
        play,
        playNext,
        playLater,
        pause,
        seekToTime,
        setVolume: handleChangeVolume,
        setShuffleMode: handleSetShuffleMode,
        setRepeatMode: handleSetRepeatMode,
        togglePlayPause,
        updateNowPlayingItem,
        updatePlaybackInfo,
        skipNext,
        skipPrevious,
        reset,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default useAudioPlayer;
