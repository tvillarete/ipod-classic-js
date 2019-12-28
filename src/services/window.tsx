import React, { createContext, useContext, useState, useCallback } from "react";
import ViewOptions, * as Views from "App/views";
import { WINDOW_TYPE } from "App/views";

export type WindowOptions<TComponent extends React.ComponentType<any> = any> = {
  /** A unique ID for each window. */
  id: string;
  /** The style of window that should be opened. */
  type: WINDOW_TYPE;
  /** The React component that will be rendered in the window. */
  component: TComponent;
  /** Props that will be passed to the component. */
  props?: Omit<React.ComponentProps<TComponent>, "id">;
  /** Any extra styles you want to pass to the window. */
  windowStyles?: Record<string, any>;
  /** Fire an event when the window closes. */
  onClose?: (...args: any[]) => void;
};

interface WindowState {
  windowStack: WindowOptions[];
  headerTitle?: string;
}

type WindowContextType = [
  WindowState,
  React.Dispatch<React.SetStateAction<WindowState>>
];

const WindowContext = createContext<WindowContextType>([
  {
    windowStack: [],
    headerTitle: "iPod"
  },
  () => {}
]);

export interface WindowServiceHook {
  /** Push an instance of WindowOptions to the windowStack. */
  showWindow: (window: WindowOptions) => void;
  /** Given an id, remove the window from the stack (otherwise, pop the top window). */
  hideWindow: (id?: string) => void;
  /** Returns an array of WindowOptions. */
  windowStack: WindowOptions[];
  /** Checks if the current window's id matches the given id.
   * Useful for enabling/disabling scrolling if a window is hidden.
   */
  isWindowActive: (id: string) => boolean;
  headerTitle?: string;
  setHeaderTitle: (title?: string) => void;
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
 *    `const {showWindow, hideWindow, windowStack} = useWindowService();`
 */
export const useWindowService = (): WindowServiceHook => {
  const [windowState, setWindowState] = useContext(WindowContext);

  const showWindow = useCallback(
    (window: WindowOptions) => {
      setWindowState(prevWindowState => ({
        ...prevWindowState,
        windowStack: [...prevWindowState.windowStack, window],
        headerTitle: ViewOptions[window.id].title
      }));
    },
    [setWindowState]
  );

  const hideWindow = useCallback(
    (id?: string) => {
      if (windowState.windowStack.length === 1) return;
      setWindowState(prevWindowState => {
        const newWindowStack = id
          ? prevWindowState.windowStack.filter(
              (window: WindowOptions) => window.id !== id
            )
          : prevWindowState.windowStack.slice(0, -1);

        return {
          ...prevWindowState,
          windowStack: newWindowStack,
          headerTitle:
            ViewOptions[newWindowStack[newWindowStack.length - 1].id].title
        };
      });
    },
    [setWindowState, windowState.windowStack.length]
  );

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
      setWindowState({
        ...windowState,
        headerTitle: title
      });
    },
    [setWindowState, windowState]
  );

  return {
    showWindow,
    hideWindow,
    isWindowActive,
    windowStack: windowState.windowStack,
    headerTitle: windowState.headerTitle,
    setHeaderTitle
  };
};

interface Props {
  children: React.ReactChild;
}

const WindowProvider = ({ children }: Props) => {
  const windowStack: WindowOptions[] = [
    {
      id: ViewOptions.home.id,
      type: WINDOW_TYPE.SPLIT,
      component: Views.HomeView
    }
  ];
  const [windowState, setWindowState] = useState<WindowState>({
    windowStack,
    headerTitle: "iPod"
  });

  return (
    <WindowContext.Provider value={[windowState, setWindowState]}>
      {children}
    </WindowContext.Provider>
  );
};

export default WindowProvider;
