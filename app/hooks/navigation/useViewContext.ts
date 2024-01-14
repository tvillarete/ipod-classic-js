import { useCallback, useContext } from "react";

import {
  ScreenViewOptionProps,
  ViewContext,
  ViewOptions,
} from "providers/ViewContextProvider";
import { SplitScreenPreview } from "components";
import views from "components/views";

export interface ViewContextHook {
  /** Push an instance of ViewOptions to the viewStack. */
  showView: (view: ViewOptions) => void;
  /** Given an id, remove the view from the stack (otherwise, pop the top view). */
  hideView: (id?: string) => void;
  /** Removes all views except the first from the viewStack. */
  resetViews: () => void;
  /** Returns an array of ViewOptions. */
  viewStack: ViewOptions[];
  /** Checks if the current view's id matches the given id.
   * Useful for enabling/disabling scrolling if a view is hidden.
   */
  isViewActive: (id: string) => boolean;
  headerTitle?: string;
  preview: SplitScreenPreview;
  setScreenViewOptions: (
    viewId: ViewOptions["id"],
    options: Partial<Omit<ScreenViewOptionProps, "id">>
  ) => void;
  setHeaderTitle: (title?: string) => void;
  setPreview: (preview: SplitScreenPreview) => void;
}

/**
 * This hook allows any component to access three parameters:
 *   1. showView
 *   2. hideView
 *   3. viewStack
 *
 *   Use it whenever you want to open a new view (@type ViewOptions).
 *
 *    @example
 *    `const {showView, hideView, viewStack} = useViewContext();`
 */
export const useViewContext = (): ViewContextHook => {
  const [viewContextState, setViewContextState] = useContext(ViewContext);

  const setHeaderTitle = useCallback(
    (title?: string) => {
      setViewContextState((prevState) => ({
        ...prevState,
        headerTitle: title,
      }));
    },
    [setViewContextState]
  );

  const showView = useCallback(
    (view: ViewOptions) => {
      setViewContextState((prevViewState) => ({
        ...prevViewState,
        viewStack: [...prevViewState.viewStack, view],
        headerTitle: view.headerTitle ?? views[view.id]?.title ?? "view",
      }));
    },
    [setViewContextState]
  );

  const hideView = useCallback(
    (id?: string) => {
      if (viewContextState.viewStack.length === 1) return;
      setViewContextState((prevViewState) => {
        const newViewStack = id
          ? prevViewState.viewStack.filter(
              (view: ViewOptions) => view.id !== id
            )
          : prevViewState.viewStack.slice(0, -1);
        const newTopView = newViewStack[newViewStack.length - 1];
        const headerTitle =
          newTopView.headerTitle ?? views[newTopView.id]?.title;

        return {
          ...prevViewState,
          headerTitle,
          viewStack: newViewStack,
        };
      });
    },
    [setViewContextState, viewContextState.viewStack.length]
  );

  const resetViews = useCallback(() => {
    setViewContextState((prevState) => ({
      ...prevState,
      viewStack: prevState.viewStack.slice(0, 1),
    }));
  }, [setViewContextState]);

  const isViewActive = useCallback(
    (id: string) => {
      const { viewStack: viewStack } = viewContextState;
      const curView = viewStack[viewStack.length - 1];
      return curView.id === id;
    },
    [viewContextState]
  );

  const setScreenViewOptions = useCallback(
    (
      viewId: ViewOptions["id"],
      options: Partial<Omit<ScreenViewOptionProps, "id">>
    ) => {
      setViewContextState((prevState) => {
        const viewIndex = prevState.viewStack.findIndex(
          ({ id }) => id === viewId
        );

        if (viewIndex === -1) {
          console.error("View not found: ", viewId);
          return prevState;
        }

        const view = prevState.viewStack[viewIndex];

        if (view?.type !== "screen") {
          console.error("View is not a screen: ", view);
          return prevState;
        }

        const updatedView = { ...view, ...options };
        const newViewStack = [...prevState.viewStack];
        newViewStack[viewIndex] = updatedView;

        return {
          ...prevState,
          viewStack: newViewStack,
        };
      });
    },
    [setViewContextState]
  );

  const setPreview = useCallback(
    (preview: SplitScreenPreview) => {
      setViewContextState((prevState) => ({
        ...prevState,
        preview,
      }));
    },
    [setViewContextState]
  );

  return {
    showView: showView,
    hideView: hideView,
    resetViews: resetViews,
    isViewActive: isViewActive,
    preview: viewContextState.preview,
    viewStack: viewContextState.viewStack,
    headerTitle: viewContextState.headerTitle,
    setScreenViewOptions,
    setHeaderTitle,
    setPreview,
  };
};

export default useViewContext;
