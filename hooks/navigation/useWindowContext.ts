import { useCallback, useContext } from 'react';

import { PREVIEW } from 'components/previews';
import ViewOptions from 'components/views';
import { WindowContext, WindowOptions } from 'providers/WindowProvider';

export interface WindowContextHook {
  /** Push an instance of WindowOptions to the windowStack. */
  showWindow: (window: WindowOptions) => void;
  /** Given an id, remove the window from the stack (otherwise, pop the top window). */
  hideWindow: (id?: string) => void;
  /** Removes all windows except the first from the windowStack. */
  resetWindows: () => void;
  /** Returns an array of WindowOptions. */
  windowStack: WindowOptions[];
  /** Checks if the current window's id matches the given id.
   * Useful for enabling/disabling scrolling if a window is hidden.
   */
  headerTitle?: string;
  preview: PREVIEW;
  isWindowActive: (id: string) => boolean;
  setHeaderTitle: (title?: string) => void;
  setPreview: (preview: PREVIEW) => void;
}

/**
 * This hook allows any component to access three parameters:
 *   1. showWindow
 *   2. hideWindow
 *   3. windowStack
 *
 *   Use it whenever you want to open a new window (@type WindowOptions).
 *
 *    @example
 *    `const {showWindow, hideWindow, windowStack} = useWindowContext();`
 */
export const useWindowContext = (): WindowContextHook => {
  const [windowState, setWindowState] = useContext(WindowContext);

  const showWindow = useCallback(
    (window: WindowOptions) => {
      setWindowState((prevWindowState) => ({
        ...prevWindowState,
        windowStack: [...prevWindowState.windowStack, window],
        headerTitle: window.headerTitle ?? ViewOptions[window.id].title,
      }));
    },
    [setWindowState]
  );

  const hideWindow = useCallback(
    (id?: string) => {
      if (windowState.windowStack.length === 1) return;
      setWindowState((prevWindowState) => {
        const newWindowStack = id
          ? prevWindowState.windowStack.filter(
              (window: WindowOptions) => window.id !== id
            )
          : prevWindowState.windowStack.slice(0, -1);

        const activeView = newWindowStack[newWindowStack.length - 1];
        const headerTitle =
          activeView.headerTitle ?? ViewOptions[activeView.id].title;

        return {
          ...prevWindowState,
          windowStack: newWindowStack,
          headerTitle,
        };
      });
    },
    [setWindowState, windowState.windowStack.length]
  );

  const resetWindows = useCallback(() => {
    setWindowState((prevState) => ({
      ...prevState,
      windowStack: prevState.windowStack.slice(0, 1),
    }));
  }, [setWindowState]);

  const isWindowActive = useCallback(
    (id: string) => {
      const { windowStack } = windowState;
      const curWindow = windowStack[windowStack.length - 1];
      return curWindow.id === id;
    },
    [windowState]
  );

  const setHeaderTitle = useCallback(
    (title?: string) => {
      setWindowState((prevState) => ({
        ...prevState,
        headerTitle: title,
      }));
    },
    [setWindowState]
  );

  const setPreview = useCallback(
    (preview: PREVIEW) => {
      setWindowState((prevState) => ({
        ...prevState,
        preview,
      }));
    },
    [setWindowState]
  );

  return {
    showWindow,
    hideWindow,
    resetWindows,
    isWindowActive,
    windowStack: windowState.windowStack,
    headerTitle: windowState.headerTitle,
    preview: windowState.preview,
    setHeaderTitle,
    setPreview,
  };
};

export default useWindowContext;
