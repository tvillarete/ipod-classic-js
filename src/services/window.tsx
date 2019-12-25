import React, { createContext, useContext, useState, useCallback } from "react";
import ViewIds, * as Views from "App/views";

export enum WINDOW_TYPE {
  SPLIT = "SPLIT",
  FULL = "FULL",
  COVER_FLOW = "COVER_FLOW"
}

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

interface WindowStackMap {
  windowStack: WindowOptions[];
}

type WindowContextType = [
  WindowStackMap,
  React.Dispatch<React.SetStateAction<WindowStackMap>>
];

const WindowContext = createContext<WindowContextType>([
  {
    windowStack: []
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
        windowStack: [...prevWindowState.windowStack, window]
      }));
    },
    [setWindowState]
  );

  const hideWindow = useCallback(
    (id?: string) => {
      if (windowState.windowStack.length === 1) return;
      setWindowState(prevWindowState => ({
        ...prevWindowState,
        windowStack: id
          ? prevWindowState.windowStack.filter(
              (window: WindowOptions) => window.id !== id
            )
          : prevWindowState.windowStack.slice(0, -1)
      }));
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

  return {
    showWindow,
    hideWindow,
    isWindowActive,
    windowStack: windowState.windowStack
  };
};

interface Props {
  children: React.ReactChild;
}

const WindowProvider = ({ children }: Props) => {
  const windowStack: WindowOptions[] = [
    {
      id: ViewIds.home,
      type: WINDOW_TYPE.FULL,
      component: Views.HomeView
    }
  ];
  const [windowState, setWindowState] = useState<WindowStackMap>({
    windowStack
  });

  return (
    <WindowContext.Provider value={[windowState, setWindowState]}>
      {children}
    </WindowContext.Provider>
  );
};

export default WindowProvider;
