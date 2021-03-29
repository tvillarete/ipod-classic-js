import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useEventListener, useMKEventListener } from 'hooks';

export interface MusicKitState {
  musicKit: typeof MusicKit;
  isConfigured: boolean;
  isAuthorized: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export interface MusicKitHook {
  isConfigured: boolean;
  isAuthorized: boolean;
  musicKit: typeof MusicKit;
  music: MusicKit.MusicKitInstance;
}

export const useMusicKit = (): MusicKitHook => {
  const musicKit = window.MusicKit;
  const { isConfigured, isAuthorized } = useContext(MusicKitContext);
  const music = useMemo(() => {
    if (!isConfigured) {
      return {} as any;
    }

    return window.MusicKit.getInstance();
  }, [isConfigured]);

  return {
    isConfigured,
    isAuthorized,
    musicKit,
    music,
  };
};

interface Props {
  children: React.ReactNode;
}

const developerToken =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJHWFFEWThYM0MifQ.eyJpYXQiOjE2MTY4ODQ1MDksImV4cCI6MTYzMjQzNjUwOSwiaXNzIjoiRzZIM0NLV005QyJ9.z7NS-8962oumCEaYOUMJfzonO2Y2tAWb_vAF_wwOkDqU8BoWTo6xDg5uG8ZvFeFpMqRoMbBaB_Mr4sxpvJzjPg';

export const MusicKitProvider = ({ children }: Props) => {
  const musicKit = window.MusicKit;
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log({ musicKit });
    musicKit.configure({
      developerToken,
      app: {
        name: 'My Cool Web App',
        build: '1978.4.1',
      },
    });
    if (musicKit.getInstance().isAuthorized) {
      setIsAuthorized(true);
    }
  }, [musicKit]);

  const handlePlayPauseClick = useCallback(() => {
    const music = musicKit.getInstance();

    if (music.player.isPlaying) {
      music.pause();
    } else {
      music.play();
    }
  }, [musicKit]);

  const handleForwardClick = useCallback(() => {
    const music = musicKit.getInstance();

    music.skipToNextItem();
  }, [musicKit]);

  const handleBackClick = useCallback(() => {
    const music = musicKit.getInstance();

    music.skipToPreviousItem();
  }, [musicKit]);

  useMKEventListener('playbackTargetAvailableDidChange', (e) => {
    console.log('playbackTargetAvailableDidChange');
  });

  useMKEventListener('userTokenDidChange', (e) => {
    console.log('Token change', e);
    setIsAuthorized(!!e.userToken);
  });

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });
  useEventListener('playpauseclick', handlePlayPauseClick);
  useEventListener('forwardclick', handleForwardClick);
  useEventListener('backclick', handleBackClick);

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured, isAuthorized }}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
