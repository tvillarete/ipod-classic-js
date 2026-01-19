import { RepeatMode, ShuffleMode } from "..";

export interface PlaybackInfo {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  timeRemaining: number;
  percent: number;
  duration: number;
}

/**
 * Unified interface for media player implementations.
 * Both Spotify and Apple Music players implement this interface,
 * ensuring they are completely interchangeable.
 */
export interface RestoredPlaybackState {
  nowPlayingItem: MediaApi.MediaItem | null;
  playbackInfo: PlaybackInfo | null;
}

export interface MediaPlayerHook {
  play: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  playNext: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  playLater: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekToTime: (time: number) => Promise<void>;
  updatePlaybackInfo: () => Promise<PlaybackInfo>;
  setShuffleMode: (mode: ShuffleMode) => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => Promise<void>;
  hasPreviousTrack: () => Promise<boolean>;
  restorePlaybackState: () => Promise<RestoredPlaybackState>;
  loadTrackPaused: (
    trackUriOrMediaItem: string | MediaApi.MediaItem,
    positionMsOrSeconds: number
  ) => Promise<void>;
  setupEventListeners: (callbacks: {
    onPlaybackStateChange?: () => void;
    onQueueChange?: () => void;
  }) => void | (() => void);
}
