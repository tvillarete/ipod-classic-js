import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActionSheetOptionProps,
  PopupOptionProps,
  SelectableListOption,
} from 'components';
import ViewOptions, { NowPlayingView, WINDOW_TYPE } from 'components/views';
import { useWindowContext } from 'hooks';

import { useAudioPlayer, useEffectOnce, useEventListener } from '../';

/** Accepts a list of options and will maintain a scroll index capped at the list's length. */
const useScrollHandler = (
  /** This should match the view's viewId (to enable/disable events for hidden views). */
  id: string,
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[] = []
): [number] => {
  const { showWindow, windowStack, setPreview } = useWindowContext();
  const { play } = useAudioPlayer();
  const [index, setIndex] = useState(0);
  const timeoutIdRef = useRef<any>();
  /** Only fire events on the top-most view. */
  const isActive = windowStack[windowStack.length - 1].id === id;

  /** Wait until the user stops scrolling to check for a new preview to display. */
  const handleCheckForPreview = useCallback(
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

  const handleForwardScroll = useCallback(() => {
    if (index < options.length - 1 && isActive) {
      setIndex(index + 1);
      handleCheckForPreview(index + 1);
    }
  }, [handleCheckForPreview, index, isActive, options.length]);

  const handleBackwardScroll = useCallback(() => {
    if (index > 0 && isActive) {
      setIndex(index - 1);
      handleCheckForPreview(index - 1);
    }
  }, [handleCheckForPreview, index, isActive]);

  const handleShowView = useCallback(
    (
      id: string,
      component: React.ReactNode,
      windowType?: WINDOW_TYPE.FULL | WINDOW_TYPE.SPLIT | WINDOW_TYPE.COVER_FLOW
    ) => {
      showWindow({
        id,
        type: windowType ?? (ViewOptions[id]?.type as any) ?? WINDOW_TYPE.FULL,
        component,
      });
    },
    [showWindow]
  );

  const handleShowPopup = useCallback(
    (options: PopupOptionProps) => {
      showWindow({
        type: WINDOW_TYPE.POPUP,
        id: options.popupId,
        title: options.title,
        description: options.description,
        listOptions: options.listOptions,
      });
    },
    [showWindow]
  );

  const handleShowActionSheet = useCallback(
    (options: ActionSheetOptionProps) => {
      showWindow({
        type: WINDOW_TYPE.ACTION_SHEET,
        id: options.id,
        listOptions: options.listOptions,
      });
    },
    [showWindow]
  );

  /** Parses the selected option for a new view to show or song to play. */
  const handleCenterClick = useCallback(async () => {
    const option = options[index];
    if (!isActive || !option) return;

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    switch (option.type) {
      case 'Song':
        await play(option.queueOptions);

        if (option.showNowPlayingView) {
          handleShowView(ViewOptions.nowPlaying.id, () => <NowPlayingView />);
        }
        break;
      case 'Link':
        window.open(option.url, '_blank');
        break;
      case 'View':
        handleShowView(option.viewId, option.component, option.windowType);
        break;
      case 'Action':
        option.onSelect();
        break;
      case 'Popup':
        handleShowPopup(option);
        break;
      case 'ActionSheet':
        handleShowActionSheet(option);
        break;
    }
  }, [
    handleShowActionSheet,
    handleShowPopup,
    handleShowView,
    index,
    isActive,
    options,
    play,
  ]);

  const handleCenterLongClick = useCallback(async () => {
    const option = options[index];

    if (!isActive || !option) return;

    if (option.longPressOptions) {
      showWindow({
        type: WINDOW_TYPE.ACTION_SHEET,
        id: ViewOptions.mediaActionSheet.id,
        listOptions: option.longPressOptions,
      });
    }
  }, [index, isActive, options, showWindow]);

  /** If the list length changes and the index is larger, reset the index to 0. */
  useEffect(() => {
    if (options.length && index > options.length - 1) {
      setIndex(0);
    }
  }, [index, options.length]);

  useEffectOnce(() => {
    if (!options || !options[0]) return;

    const preview = options[0].preview;
    if (preview) {
      setPreview(preview);
    }
  });

  useEventListener('centerclick', () => {
    handleCenterClick();
  });
  useEventListener('centerlongclick', handleCenterLongClick);
  useEventListener('forwardscroll', handleForwardScroll);
  useEventListener('backwardscroll', handleBackwardScroll);

  return [index];
};

export default useScrollHandler;
