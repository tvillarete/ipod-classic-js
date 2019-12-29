import { useCallback, useState } from 'react';

import ViewOptions from 'App/views';
import { SelectableListOption } from 'components';
import { useAudioService } from 'services/audio';
import { useWindowService } from 'services/window';

import useEventListener from './useEventListener';

/** Accepts a list of options and will maintain a scroll index capped at the list's length. */
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

  const forwardScroll = useCallback(() => {
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

    /** If a viewId is found, that means there's a new view to show. */
    if (option.viewId) {
      const View = option.value;
      const viewOptions = ViewOptions[option.viewId];

      showWindow({
        type: viewOptions.type,
        id: option.viewId,
        component: View
      });
    }

    /** If a song is found, play the song. */
    if (option.playlist) {
      play(option.playlist, option.songIndex);
    }
  }, [index, isActive, options, play, showWindow]);

  useEventListener("centerclick", centerClick);
  useEventListener("forwardscroll", forwardScroll);
  useEventListener("backwardscroll", backwardScroll);

  return [index];
};

export default useScrollHandler;
