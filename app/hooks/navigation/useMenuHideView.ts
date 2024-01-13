import { useCallback } from "react";

import { useEventListener, useViewContext } from "hooks";

import { IpodEvent } from "utils/events";

/**
 * A quick way to use the menu button as a back button.
 * Provide an ID that matches the ID of the window you want to close.
 */
const useMenuHideView = (id: string) => {
  const { hideView, viewStack } = useViewContext();

  const handleClick = useCallback(() => {
    if (viewStack[viewStack.length - 1].id === id) {
      hideView();
    }
  }, [hideView, id, viewStack]);

  useEventListener<IpodEvent>("menuclick", handleClick);
};

export default useMenuHideView;
