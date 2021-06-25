import { useCallback } from 'react';

import { useWindowContext } from 'hooks';

import useEventListener from '../utils/useEventListener';
import { IpodEvent } from 'utils/events';

/**
 * A quick way to use the menu button as a back button.
 * Provide an ID that matches the ID of the window you want to close.
 */
const useMenuHideWindow = (id: string) => {
  const { windowStack, hideWindow } = useWindowContext();

  const handleClick = useCallback(() => {
    if (windowStack[windowStack.length - 1].id === id) {
      hideWindow();
    }
  }, [hideWindow, id, windowStack]);

  useEventListener<IpodEvent>('menuclick', handleClick);
};

export default useMenuHideWindow;
