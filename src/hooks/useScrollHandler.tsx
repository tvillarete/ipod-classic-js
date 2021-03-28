import React, { useCallback, useRef, useState } from 'react';

import ViewOptions, { NowPlayingView, WINDOW_TYPE } from 'App/views';
import { SelectableListOption } from 'components';
import { useWindowService } from 'services/window';

import useEffectOnce from './useEffectOnce';
import useEventListener from './useEventListener';
import { useMusicKit } from './useMusicKit';

/** Accepts a list of options and will maintain a scroll index capped at the list's length. */
const useScrollHandler = (
  /** This should match the view's viewId (to enable/disable events for hidden views). */
  id: string,
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[]
): [number] => {
  const { showWindow, windowStack, setPreview } = useWindowService();
  const { music } = useMusicKit();
  const [index, setIndex] = useState(0);
  const timeoutIdRef = useRef<any>();
  /** Only fire events on the top-most view. */
  const isActive = windowStack[windowStack.length - 1].id === id;

  /** Wait until the user stops scrolling to check for a new preview to display. */
  const checkForPreview = useCallback(
    (i: number) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (!isActive || !options[i]) return;
      timeoutIdRef.current = setTimeout(() => {
        const preview = options[i].preview;
        if (preview) {
          setPreview(preview);
        }
      }, 750);

      return () => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
      };
    },
    [isActive, options, setPreview]
  );

  const forwardScroll = useCallback(() => {
    if (index < options.length - 1 && isActive) {
      setIndex(index + 1);
      checkForPreview(index + 1);
    }
  }, [checkForPreview, index, isActive, options.length]);

  const backwardScroll = useCallback(() => {
    if (index > 0 && isActive) {
      setIndex(index - 1);
      checkForPreview(index - 1);
    }
  }, [checkForPreview, index, isActive]);

  const handlePlaySong = useCallback(
    async (queueOptions: MusicKit.SetQueueOptions) => {
      const queue = await music.setQueue({
        ...queueOptions,
      });

      if (!queue.isEmpty && queue.nextPlayableItem) {
        await music.play();
      }
    },
    [music]
  );

  const handleShowView = useCallback(
    (id: string, component: React.ReactNode, windowType?: WINDOW_TYPE) => {
      showWindow({
        id,
        type: windowType ?? ViewOptions[id]?.type ?? WINDOW_TYPE.FULL,
        component,
      });
    },
    [showWindow]
  );

  /** Parses the selected option for a new view to show or song to play. */
  const centerClick = useCallback(async () => {
    const option = options[index];
    if (!isActive || !option) return;

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    if (option.type === 'Song') {
      await handlePlaySong(option.queueOptions);

      if (option.showNowPlayingView) {
        handleShowView(ViewOptions.nowPlaying.id, () => <NowPlayingView />);
      }
    } else if (option.type === 'Link') {
      window.open(option.url, '_blank');
    } else if (option.type === 'View') {
      handleShowView(option.viewId, option.component, option.windowType);
    }
  }, [handlePlaySong, handleShowView, index, isActive, options]);

  useEffectOnce(() => {
    if (!options || !options[0]) return;

    const preview = options[0].preview;
    if (preview) {
      setPreview(preview);
    }
  });

  useEventListener('centerclick', () => {
    centerClick();
  });
  useEventListener('forwardscroll', forwardScroll);
  useEventListener('backwardscroll', backwardScroll);

  return [index];
};

export default useScrollHandler;
