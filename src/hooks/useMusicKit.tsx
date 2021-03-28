import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useEventListener } from 'hooks';

export interface MusicKitState {
  musicKit: typeof MusicKit;
  isConfigured: boolean;
}

export const MusicKitContext = createContext<MusicKitState>({} as any);

export interface MusicKitHook {
  isConfigured: boolean;
  music: MusicKit.MusicKitInstance;
}

export const useMusicKit = (): MusicKitHook => {
  const { isConfigured } = useContext(MusicKitContext);
  const music = useMemo(() => {
    if (!isConfigured) {
      return {} as any;
    }

    return window.MusicKit.getInstance();
  }, [isConfigured]);

  // const getUserAlbums = useCallback(async () => {
  //   console.log('Getting albums');
  //   const music = window.MusicKit.getInstance();

  //   return music.api.library.albums(null);
  // }, []);

  return {
    isConfigured,
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

  useEffect(() => {
    console.log({ musicKit });
    musicKit.configure({
      developerToken,
      app: {
        name: 'My Cool Web App',
        build: '1978.4.1',
      },
    });

    musicKit.getInstance().authorize();
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

  useEventListener('musickitconfigured', () => {
    setIsConfigured(true);
  });

  useEventListener('playpauseclick', handlePlayPauseClick);
  useEventListener('forwardclick', handleForwardClick);
  useEventListener('backclick', handleBackClick);

  return (
    <MusicKitContext.Provider value={{ musicKit, isConfigured }}>
      {children}
    </MusicKitContext.Provider>
  );
};

export default memo(MusicKitProvider);
