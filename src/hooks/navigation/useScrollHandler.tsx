import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActionSheetOptionProps,
  PopupOptionProps,
  SelectableListOption,
} from 'components';
import ViewOptions, { NowPlayingView, WINDOW_TYPE } from 'components/views';
import { useWindowContext } from 'hooks';
import useHapticFeedback from 'hooks/useHapticFeedback';
import { IpodEvent } from 'utils/events';

import { useAudioPlayer, useEffectOnce, useEventListener } from '../';

/** Gets the initial index for the scroll position. If there is a selected option,
 * this will initialize our initial scroll position at the selectedOption  */
const getInitIndex = (
  options: SelectableListOption[] = [],
  selectedOption?: SelectableListOption
): number => {
  if (selectedOption) {
    const selectedOptionIndex = options.findIndex(
      (option) => option === selectedOption
    );

    if (selectedOptionIndex > -1) {
      return selectedOptionIndex;
    }
  }

  // Always default to 0 if there isn't a selectedOption
  // or if the selectedOption wasn't found in the list of options.
  return 0;
};

/** Accepts a list of options and will maintain a scroll index capped at the list's length. */
const useScrollHandler = (
  /** This should match the view's viewId (to enable/disable events for hidden views). */
  id: string,
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[] = [],
  selectedOption?: SelectableListOption,
  /**
   * This function is called when the user has scrolled close to the end of the list of options.
   * Useful for fetching the next page of data before the user reaches the end of the list.
   */
  onNearEndOfList?: (...args: any) => any
): [number] => {
  const { triggerHaptics } = useHapticFeedback();
  const { showWindow, windowStack, setPreview } = useWindowContext();
  const { play } = useAudioPlayer();
  const [index, setIndex] = useState(getInitIndex(options, selectedOption));
  const timeoutIdRef = useRef<NodeJS.Timeout>();
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
    setIndex((prevIndex) => {
      if (prevIndex < options.length - 1 && isActive) {
        triggerHaptics(10);
        handleCheckForPreview(prevIndex + 1);

        // Trigger near-end-of-list callback when we're halfway through the current list.
        if (prevIndex === Math.round(options.length / 2)) {
          onNearEndOfList?.(options.length);
        }

        return prevIndex + 1;
      }

      return prevIndex;
    });
  }, [
    handleCheckForPreview,
    isActive,
    onNearEndOfList,
    options.length,
    triggerHaptics,
  ]);

  const handleBackwardScroll = useCallback(() => {
    setIndex((prevIndex) => {
      if (prevIndex > 0 && isActive) {
        triggerHaptics(10);
        handleCheckForPreview(prevIndex + 1);
        return prevIndex - 1;
      }

      return prevIndex;
    });
  }, [handleCheckForPreview, isActive, triggerHaptics]);

  const handleShowView = useCallback(
    (
      id: string,
      component: React.ReactNode,
      windowType?:
        | WINDOW_TYPE.FULL
        | WINDOW_TYPE.SPLIT
        | WINDOW_TYPE.COVER_FLOW,
      headerTitle?: string
    ) => {
      showWindow({
        id,
        type: windowType ?? (ViewOptions[id]?.type as any) ?? WINDOW_TYPE.FULL,
        component,
        headerTitle,
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
    triggerHaptics(10);

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
        handleShowView(
          option.viewId,
          option.component,
          option.windowType,
          option.headerTitle
        );
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
    triggerHaptics,
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

  useEventListener<IpodEvent>('centerclick', handleCenterClick);
  useEventListener<IpodEvent>('centerlongclick', handleCenterLongClick);
  useEventListener<IpodEvent>('forwardscroll', handleForwardScroll);
  useEventListener<IpodEvent>('backwardscroll', handleBackwardScroll);

  return [index];
};

export default useScrollHandler;
