import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useEventListener, useMKEventListener } from 'hooks';
import * as ConversionUtils from 'utils/conversion';

import { useMusicKit, useSettings, useSpotifySDK, VOLUME_KEY } from '../';

export interface AudioPlayerState {
  playbackInfo: {
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
    currentTime: number;
    timeRemaining: number;
    percent: number;
    duration: number;
  };
  nowPlayingItem?: IpodApi.MediaItem;
  volume: number;
  play: (queueOptions: IpodApi.QueueOptions) => Promise<void>;
  pause: () => Promise<void>;
  seekToTime: (time: number) => void;
  setVolume: (volume: number) => void;
  updateNowPlayingItem: () => void;
  updatePlaybackInfo: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerState>({} as any);

type AudioPlayerHook = AudioPlayerState;

export const useAudioPlayer = (): AudioPlayerHook => {
  const state = useContext(AudioPlayerContext);

  return {
    ...state,
  };
};

interface Props {
  children: React.ReactNode;
}

export const AudioPlayerProvider = ({ children }: Props) => {
  const { service, isSpotifyAuthorized, isAppleAuthorized } = useSettings();
  const { spotifyPlayer, accessToken, deviceId } = useSpotifySDK();
  const { music } = useMusicKit();
  const [volume, setVolume] = useState(0.5);
  const [nowPlayingItem, setNowPlayingItem] = useState<IpodApi.MediaItem>();
  const [playbackInfo, setPlaybackInfo] = useState<
    AudioPlayerState['playbackInfo']
  >({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    timeRemaining: 0,
    percent: 0,
    duration: 0,
  });

  const playAppleMusic = useCallback(
    async (queueOptions: IpodApi.QueueOptions) => {
      if (!isAppleAuthorized) {
        throw new Error('Unable to play: Not authorized');
      }

      await music.setQueue({
        album: queueOptions.album?.id,
        playlist: queueOptions.playlist?.id,
        songs: queueOptions.songs?.map((song) => song.url),
        song: queueOptions.song?.id,
        // MusicKit has a weird issue where the start position needs to be subtracted by 1.
        startPosition: queueOptions.startPosition
          ? queueOptions.startPosition - 1
          : undefined,
      });

      await music.play();
    },
    [isAppleAuthorized, music]
  );

  const playSpotify = useCallback(
    async (queueOptions: IpodApi.QueueOptions) => {
      if (!isSpotifyAuthorized) {
        throw new Error('Unable to play: Not authorized');
      }

      // Spotify only accepts a list of song URIs, so we'll look through each media type provided for songs.
      const uris = [
        ...(queueOptions.album?.songs?.map((song) => song.url) ?? []),
        ...(queueOptions.playlist?.songs?.map((song) => song.url) ?? []),
        ...(queueOptions.songs?.map((song) => song.url) ?? []),
        queueOptions.song?.url,
      ].filter((item) => !!item);

      setPlaybackInfo((prevState) => ({
        ...prevState,
        isLoading: true,
      }));

      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            uris,
            offset: { position: queueOptions.startPosition },
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setPlaybackInfo((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    },
    [accessToken, deviceId, isSpotifyAuthorized]
  );

  const play = useCallback(
    async (queueOptions: IpodApi.QueueOptions) => {
      switch (service) {
        case 'apple':
          return playAppleMusic(queueOptions);
        case 'spotify':
          return playSpotify(queueOptions);
        default:
          throw new Error('Unable to play: service not specified');
      }
    },
    [playAppleMusic, playSpotify, service]
  );

  const pause = useCallback(async () => {
    switch (service) {
      case 'apple':
        return spotifyPlayer.pause();
      case 'spotify':
        return music.pause();
      default:
        throw new Error('Unable to play: service not specified');
    }
  }, [music, service, spotifyPlayer]);

  const togglePlayPause = useCallback(async () => {
    if (!nowPlayingItem) {
      return;
    }

    switch (service) {
      case 'apple':
        if (music.player.isPlaying) {
          return music.pause();
        } else if (!music.player.isPlaying) {
          music.play();
        }
        break;
      case 'spotify':
        return spotifyPlayer.togglePlay();
      default:
        throw new Error('Unable to play: service not specified');
    }
  }, [music, nowPlayingItem, service, spotifyPlayer]);

  const skipNext = useCallback(async () => {
    if (!nowPlayingItem) {
      return;
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    switch (service) {
      case 'apple':
        if (music.player.nowPlayingItem) {
          await music.skipToNextItem();
        }
        break;
      case 'spotify':
        await spotifyPlayer.nextTrack();
        break;
      default:
        throw new Error('Unable to play: service not specified');
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  }, [music, nowPlayingItem, service, spotifyPlayer]);

  const skipPrevious = useCallback(async () => {
    if (!nowPlayingItem) {
      return;
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    switch (service) {
      case 'apple':
        if (music.player.nowPlayingItem) {
          await music.skipToPreviousItem();
        }
        break;
      case 'spotify':
        await spotifyPlayer.previousTrack();
        break;
      default:
        throw new Error('Unable to play: service not specified');
    }

    setPlaybackInfo((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  }, [music, nowPlayingItem, service, spotifyPlayer]);

  const updateNowPlayingItem = useCallback(async () => {
    let mediaItem: IpodApi.MediaItem | undefined;

    if (service === 'apple' && music.player.nowPlayingItem) {
      mediaItem = ConversionUtils.convertAppleMediaItem(
        music.player.nowPlayingItem
      );
    } else if (service === 'spotify') {
      const state = await spotifyPlayer.getCurrentState();

      if (state) {
        mediaItem = ConversionUtils.convertSpotifyMediaItem(state);
      }
    }

    setNowPlayingItem(mediaItem);
  }, [music.player.nowPlayingItem, service, spotifyPlayer]);

  const handleApplePlaybackStateChange = useCallback(
    ({ state }: { state: MusicKit.PlaybackStates }) => {
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
    (state: Spotify.PlaybackState) => {
      if (state.disallows.resuming) {
        setPlaybackInfo((prevState) => ({
          ...prevState,
          isPlaying: true,
          isPaused: false,
          isLoading: false,
        }));
      } else if (state.paused) {
        setPlaybackInfo((prevState) => ({
          ...prevState,
          isPlaying: false,
          isPaused: true,
          isLoading: false,
        }));
      }

      updateNowPlayingItem();
    },
    [updateNowPlayingItem]
  );

  const updatePlaybackInfo = useCallback(async () => {
    if (service === 'apple') {
      setPlaybackInfo((prevState) => ({
        ...prevState,
        currentTime: music.player.currentPlaybackTime,
        timeRemaining: music.player.currentPlaybackTimeRemaining,
        percent: music.player.currentPlaybackProgress * 100,
        duration: music.player.currentPlaybackDuration,
      }));
    } else if (service === 'spotify') {
      const state = await spotifyPlayer.getCurrentState();
      const currentTime = (state?.position ?? 0) / 1000;
      const maxTime = (state?.duration ?? 0) / 1000;
      const timeRemaining = maxTime - currentTime;
      const percent = Math.round((currentTime / maxTime) * 100);

      setPlaybackInfo((prevState) => ({
        ...prevState,
        currentTime,
        timeRemaining,
        percent,
        duration: maxTime,
      }));
    }
  }, [music.player, service, spotifyPlayer]);

  const seekToTime = useCallback(
    async (time: number) => {
      if (service === 'apple') {
        await music.player.seekToTime(time);
      } else if (service === 'spotify') {
        // Seek to time (in ms)
        await spotifyPlayer.seek(time * 1000);
      }

      updatePlaybackInfo();
    },
    [music.player, service, spotifyPlayer, updatePlaybackInfo]
  );

  const handleChangeVolume = useCallback(
    (newVolume: number) => {
      if (isSpotifyAuthorized) {
        spotifyPlayer.setVolume(newVolume);
      }

      if (isAppleAuthorized) {
        music.player.volume = newVolume;
      }

      localStorage.setItem(VOLUME_KEY, `${newVolume}`);

      setVolume(newVolume);
    },
    [isAppleAuthorized, isSpotifyAuthorized, music.player, spotifyPlayer]
  );

  useEventListener('playpauseclick', () => {
    togglePlayPause();
  });

  useEventListener('forwardclick', () => {
    skipNext();
  });

  useEventListener('backclick', () => {
    skipPrevious();
  });

  // Apple playback event listeners
  useMKEventListener('playbackStateDidChange', handleApplePlaybackStateChange);
  useMKEventListener('queuePositionDidChange', updateNowPlayingItem);

  useEffect(() => {
    if (isSpotifyAuthorized) {
      spotifyPlayer.addListener(
        'player_state_changed',
        handleSpotifyPlaybackStateChange
      );

      const savedVolume = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '0.5');

      handleChangeVolume(savedVolume);

      return () =>
        spotifyPlayer.removeListener(
          'player_state_changed',
          handleSpotifyPlaybackStateChange
        );
    }
  }, [
    handleChangeVolume,
    handleSpotifyPlaybackStateChange,
    isSpotifyAuthorized,
    spotifyPlayer,
  ]);

  useEffect(() => {
    if (isAppleAuthorized) {
      const savedVolume = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '0.5');
      handleChangeVolume(savedVolume);
    }
  }, [handleChangeVolume, isAppleAuthorized]);

  return (
    <AudioPlayerContext.Provider
      value={{
        playbackInfo,
        nowPlayingItem,
        volume,
        play,
        pause,
        seekToTime,
        setVolume: handleChangeVolume,
        updateNowPlayingItem,
        updatePlaybackInfo,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default useAudioPlayer;
