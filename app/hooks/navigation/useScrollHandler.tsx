import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { SelectableListOption } from "@/components";
import { ViewId } from "@/components/views/registry";
import { PopupId, ActionSheetId } from "@/providers/ViewContextProvider";
import useHapticFeedback from "@/hooks/useHapticFeedback";
import { IpodEvent, ScrollEventDetail } from "@/utils/events";
import { VELOCITY_SKIP_THRESHOLDS } from "@/components/ClickWheel/constants";

import { useEventListener, useViewContext } from "@/hooks";

const getSkipCount = (event: Event): number => {
  const velocity =
    event instanceof CustomEvent
      ? (event as CustomEvent<ScrollEventDetail>).detail?.velocity ?? 0
      : 0;

  let skip = 1;
  for (const tier of VELOCITY_SKIP_THRESHOLDS) {
    if (velocity >= tier.minVelocity) {
      skip = tier.skip;
    }
  }
  return skip;
};

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

  return 0;
};

/** Accepts a list of options and will maintain a scroll index capped at the list's length. */
const useScrollHandler = (
  /** This should match the view's ID (screen view, popup, action sheet, or keyboard). */
  id: ViewId | PopupId | ActionSheetId | "keyboard",
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[] = [],
  selectedOption?: SelectableListOption,
  /**
   * This function is called when the user has scrolled close to the end of the list of options.
   * Useful for fetching the next page of data before the user reaches the end of the list.
   */
  onNearEndOfList?: (currentLength: number) => void
): [number] => {
  const { triggerHaptics } = useHapticFeedback();
  const { viewStack, setPreview } = useViewContext();
  const [index, setIndex] = useState(getInitIndex(options, selectedOption));
  /** Only fire events on the top-most view. */
  const isActive = viewStack[viewStack.length - 1].id === id;

  /** Wait until the user stops scrolling to check for a new preview to display. */
  const updatePreview = useCallback(
    (i: number) => {
      if (!isActive || !options[i]) return;
      const preview = options[i].preview;
      if (preview) {
        setPreview(preview);
      }
    },
    [isActive, options, setPreview]
  );

  const debouncedUpdatePreview = useDebouncedCallback(updatePreview, 750);

  const handleForwardScroll = useCallback(
    (event: Event) => {
      if (isActive) {
        triggerHaptics(true);
      }

      const skip = getSkipCount(event);

      setIndex((prevIndex) => {
        if (prevIndex < options.length - 1 && isActive) {
          const nextIndex = Math.min(prevIndex + skip, options.length - 1);
          debouncedUpdatePreview(nextIndex);

          if (nextIndex >= Math.round(options.length / 2)) {
            onNearEndOfList?.(options.length);
          }

          return nextIndex;
        }

        return prevIndex;
      });
    },
    [
      debouncedUpdatePreview,
      isActive,
      onNearEndOfList,
      options.length,
      triggerHaptics,
    ]
  );

  const handleBackwardScroll = useCallback(
    (event: Event) => {
      if (isActive) {
        triggerHaptics(true);
      }

      const skip = getSkipCount(event);

      setIndex((prevIndex) => {
        if (prevIndex > 0 && isActive) {
          const nextIndex = Math.max(prevIndex - skip, 0);
          debouncedUpdatePreview(nextIndex);
          return nextIndex;
        }

        return prevIndex;
      });
    },
    [debouncedUpdatePreview, isActive, triggerHaptics]
  );

  /** If the list length changes and the index is larger, reset the index to 0. */
  useEffect(() => {
    if (options.length && index > options.length - 1) {
      setIndex(0);
    }
  }, [index, options.length]);

  /** Set the initial preview when options load or index changes */
  useEffect(() => {
    debouncedUpdatePreview(index);
  }, [index, debouncedUpdatePreview]);

  useEventListener<IpodEvent>("forwardscroll", handleForwardScroll);
  useEventListener<IpodEvent>("backwardscroll", handleBackwardScroll);

  return [index];
};

export default useScrollHandler;
