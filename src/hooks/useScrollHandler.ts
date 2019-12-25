import { useState, useCallback } from "react";
import { SelectableListOption } from "components";
import { useWindowService, WINDOW_TYPE } from "services/window";
import useEventListener from "./useEventListener";

const useScrollHandler = (
  /** This should match the id of the view (to enable/disable events). */
  id: string,
  /** A list of all scrollable items. Used to cap the scrolling to the last element. */
  options: SelectableListOption[]
): [number] => {
  const { showWindow, windowStack } = useWindowService();
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

  const centerClick = useCallback(() => {
    if (!isActive) return;

    const View = options[index].value;

    showWindow({
      type: WINDOW_TYPE.FULL,
      id: options[index].label,
      component: View
    });
  }, [index, isActive, options, showWindow]);

  useEventListener("centerclick", centerClick);
  useEventListener("forwardscroll", forwardSCroll);
  useEventListener("backwardscroll", backwardScroll);

  return [index];
};

export default useScrollHandler;
