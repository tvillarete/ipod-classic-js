/**
 * MusicKit V3 Type Extensions
 *
 * This file extends the existing @types/musickit-js definitions
 * to include properties and methods available in MusicKit JS V3
 * that are not yet present in the official type definitions.
 */

declare namespace MusicKit {
  interface MusicKitInstance {
    // Playback state properties
    isPlaying: boolean;

    // Current playback information
    currentPlaybackTime: number;
    currentPlaybackTimeRemaining: number;
    currentPlaybackProgress: number;
    currentPlaybackDuration: number;

    // Current item
    nowPlayingItem: MusicKit.MediaItem | null;

    // Volume control
    volume: number;
  }
}
