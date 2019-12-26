import { useState, useCallback } from "react";
import { SelectableListOption } from "components";
import { useWindowService, WINDOW_TYPE } from "services/window";
import useEventListener from "./useEventListener";
import { useAudioService } from "services/audio";

const useScrollHandler = (
  /** This should match the view's viewId (to enable/disable events for hidden views). */
  id: string,
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[]
): [number] => {
  const { showWindow, windowStack } = useWindowService();
  const { play } = useAudioService();
  const [index, setIndex] = useState(0);
  /** Only fire events on the top-most view. */
  const isActive = windowStack[windowStack.length - 1].id === id;

  const forwardSCroll = useCallback(() => {
    if (index < options.length - 1 && isActive) {
      setIndex(index + 1);
    }
  }, [index, isActive, options.length]);

  const backwardScroll = useCallback(() => {
    if (index > 0 && isActive) {
      setIndex(index - 1);
    }
  }, [index, isActive]);

  /** Parses the selected option for a new view to show or song to play. */
  const centerClick = useCallback(() => {
    const option = options[index];
    if (!isActive || !option) return;

    const View = option.value;
    const viewId = option.viewId || option.label;

    /** If a viewId is found, that means there's a new view to show. */
    if (viewId) {
      showWindow({
        type: WINDOW_TYPE.FULL,
        id: viewId,
        component: View
      });
    }

    /** If a song is found, play the song. */
    if (option.song) {
      play([option.song]);
    }
  }, [index, isActive, options, play, showWindow]);

  useEventListener("centerclick", centerClick);
  useEventListener("forwardscroll", forwardSCroll);
  useEventListener("backwardscroll", backwardScroll);

  return [index];
};

export default useScrollHandler;
