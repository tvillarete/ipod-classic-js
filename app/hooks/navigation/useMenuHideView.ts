import { useCallback } from "react";

import { useEventListener, useViewContext, useHapticFeedback } from "@/hooks";

import { IpodEvent } from "@/utils/events";

/**
 * A quick way to use the menu button as a back button.
 * Provide an ID that matches the ID of the window you want to close.
 */
const useMenuHideView = (id: string) => {
  const { hideView, viewStack } = useViewContext();
  const { triggerHaptics } = useHapticFeedback();

  const handleClick = useCallback(() => {
    if (viewStack[viewStack.length - 1].id === id) {
      triggerHaptics();
      hideView();
    }
  }, [hideView, id, viewStack, triggerHaptics]);

  useEventListener<IpodEvent>("menuclick", handleClick);
};

export default useMenuHideView;
