import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ViewOptions } from 'components';
import { useEventListener, useMKEventListener, useWindowContext } from 'hooks';
import * as ConversionUtils from 'utils/conversion';
import { IpodEvent } from 'utils/events';

import { useMusicKit, useSettings, useSpotifySDK, VOLUME_KEY } from '../';

const defaultPlatbackInfoState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  timeRemaining: 0,
  percent: 0,
  duration: 0,
};

interface AudioPlayerState {
  playbackInfo: typeof defaultPlatbackInfoState;
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
  const { windowStack } = useWindowContext();
  const { service, isSpotifyAuthorized, isAppleAuthorized } = useSettings();
  const { spotifyPlayer, accessToken, deviceId } = useSpotifySDK();
  const { music } = useMusicKit();
  const [volume, setVolume] = useState(0.5);
  const [nowPlayingItem, setNowPlayingItem] = useState<IpodApi.MediaItem>();
  const [playbackInfo, setPlaybackInfo] = useState(defaultPlatbackInfoState);

  const playAppleMusic = useCallback(
    async (queueOptions: IpodApi.QueueOptions) => {
      if (!isAppleAuthorized) {
        throw new Error('Unable to play: Not authorized');
      }

      /**
       * MusicKit JS V3 doesn't seem to support passing in a single playlist id to the queue.
       * A workaround is to just grab the song ids instead.
       * */
      const playlistSongs = queueOptions.playlist?.songs?.map(({ id }) => id);

      /**
       * MusicKit JS V3 expects only a single media type with no empty keys.
       * We're filtering out any keys that are undefined.
       *
       * @example { album: 'a.12345', startPosition: 0 }
       */
      const queue = Object.fromEntries(
        Object.entries({
          album: queueOptions.album?.id,
          songs: playlistSongs ?? queueOptions.songs?.map((song) => song.url),
          song: queueOptions.song?.id,
          startPosition: queueOptions.startPosition,
        }).filter(([_, value]) => value !== undefined)
      );

      await music.setQueue({ ...queue });

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
    const activeWindow = windowStack[windowStack.length - 1];

    // Don't toggle play/pause when using the on-screen keyboard.
    if (!nowPlayingItem || activeWindow.id === ViewOptions.keyboard.id) {
      return;
    }

    switch (service) {
      case 'apple':
        // TODO: Update types for MusicKit V3
        if ((music as any).isPlaying) {
          music.pause();
          // TODO: Update types for MusicKit V3
        } else if (!(music as any).isPlaying) {
          music.play();
        }
        break;
      case 'spotify':
        spotifyPlayer.togglePlay();
        break;
      default:
        throw new Error('Unable to play: service not specified');
    }
  }, [music, nowPlayingItem, service, spotifyPlayer, windowStack]);

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
        // TODO: Update types for MusicKit V3
        if ((music as any).nowPlayingItem) {
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
        // TODO: Update types for MusicKit V3
        if ((music as any).nowPlayingItem) {
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

    // TODO: Update types for MusicKit V3
    if (service === 'apple' && (music as any).nowPlayingItem) {
      // TODO: Update types for MusicKit V3
      mediaItem = ConversionUtils.convertAppleMediaItem(
        (music as any).nowPlayingItem
      );
    } else if (service === 'spotify') {
      const state = await spotifyPlayer.getCurrentState();

      if (state) {
        mediaItem = ConversionUtils.convertSpotifyMediaItem(state);
      }
    }

    setNowPlayingItem(mediaItem);
  }, [music, service, spotifyPlayer]);

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
    (state?: Spotify.PlaybackState) => {
      if (!state) {
        return;
      }

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
        // TODO: Update types for MusicKit V3
        currentTime: (music as any).currentPlaybackTime,
        timeRemaining: (music as any).currentPlaybackTimeRemaining,
        percent: (music as any).currentPlaybackProgress * 100,
        duration: (music as any).currentPlaybackDuration,
      }));
    } else if (service === 'spotify') {
      const { position, duration } =
        (await spotifyPlayer.getCurrentState()) ?? {};
      const currentTime = (position ?? 0) / 1000;
      const maxTime = (duration ?? 0) / 1000;
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
  }, [music, service, spotifyPlayer]);

  const seekToTime = useCallback(
    async (time: number) => {
      if (service === 'apple') {
        // TODO: Update types for MusicKit V3
        await (music as any).player.seekToTime(time);
      } else if (service === 'spotify') {
        // Seek to time (in ms)
        await spotifyPlayer.seek(time * 1000);
      }

      updatePlaybackInfo();
    },
    [music, service, spotifyPlayer, updatePlaybackInfo]
  );

  const handleChangeVolume = useCallback(
    (newVolume: number) => {
      if (isSpotifyAuthorized) {
        spotifyPlayer.setVolume(newVolume);
      }

      if (isAppleAuthorized) {
        // TODO: Update types for MusicKit V3
        (music as any).volume = newVolume;
      }

      localStorage.setItem(VOLUME_KEY, `${newVolume}`);

      setVolume(newVolume);
    },
    [isAppleAuthorized, isSpotifyAuthorized, music, spotifyPlayer]
  );

  useEventListener<IpodEvent>('playpauseclick', () => {
    togglePlayPause();
  });

  useEventListener<IpodEvent>('forwardclick', () => {
    skipNext();
  });

  useEventListener<IpodEvent>('backwardclick', () => {
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
