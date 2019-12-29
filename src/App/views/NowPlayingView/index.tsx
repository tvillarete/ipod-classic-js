import React, { useCallback, useEffect, useState } from 'react';

import ViewOptions from 'App/views';
import { NowPlaying } from 'components';
import { useMenuHideWindow } from 'hooks';
import { useAudioService } from 'services/audio';
import { useWindowService } from 'services/window';

const NowPlayingView = () => {
  useMenuHideWindow(ViewOptions.nowPlaying.id);
  const { source } = useAudioService();
  const { hideWindow } = useWindowService();
  const [windowHidden, setWindowHidden] = useState(false);

  const handleWindowHide = useCallback(() => {
    if (!windowHidden) {
      hideWindow();
      setWindowHidden(true);
    }
  }, [hideWindow, windowHidden]);

  useEffect(() => {
    if (!source) {
      handleWindowHide();
    }
  }, [handleWindowHide, hideWindow, source]);

  return <NowPlaying />;
};

export default NowPlayingView;
