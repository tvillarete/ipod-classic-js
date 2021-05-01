import { useCallback } from 'react';

import { useWindowService } from 'services/window';

import useEventListener from '../utils/useEventListener';

/**
 * A quick way to use the menu button as a back button.
 * Provide an ID that matches the ID of the window you want to close.
 */
const useMenuHideWindow = (id: string) => {
  const { windowStack, hideWindow } = useWindowService();

  const handleClick = useCallback(() => {
    if (windowStack[windowStack.length - 1].id === id) {
      hideWindow();
    }
  }, [hideWindow, id, windowStack]);

  useEventListener('menuclick', handleClick);
};

export default useMenuHideWindow;
