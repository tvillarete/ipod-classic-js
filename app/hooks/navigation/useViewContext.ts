import { useCallback, useContext } from "react";

import { SplitScreenPreview } from "@/components/previews";
import { ViewId, ViewProps, VIEW_REGISTRY } from "@/components/views/registry";
import {
  ViewContext,
  ViewInstance,
  ScreenViewInstance,
  ActionSheetInstance,
  PopupInstance,
  KeyboardInstance,
} from "@/providers/ViewContextProvider";

/**
 * Type-safe parameters for showView function.
 * - If view requires props: [props, headerTitle?]
 * - If view has no props: [props?, headerTitle?]
 */
type ShowViewArgs<TViewId extends ViewId> = ViewProps[TViewId] extends undefined
  ? [props?: undefined, headerTitle?: string]
  : [props: ViewProps[TViewId], headerTitle?: string];

export interface ViewContextHook {
  /** Push a screen view to the viewStack (type-safe with registry). */
  showView: <TViewId extends ViewId>(
    viewId: TViewId,
    ...args: ShowViewArgs<TViewId>
  ) => void;
  /** Show an action sheet overlay */
  showActionSheet: (options: Omit<ActionSheetInstance, "type">) => void;
  /** Show a popup overlay */
  showPopup: (options: Omit<PopupInstance, "type">) => void;
  /** Show keyboard overlay */
  showKeyboard: (options: Omit<KeyboardInstance, "type">) => void;
  /** Given an id, remove the view from the stack (otherwise, pop the top view). */
  hideView: (id?: string) => void;
  /** Removes all views except the first from the viewStack. */
  resetViews: () => void;
  /** Returns an array of ViewInstance. */
  viewStack: ViewInstance[];
  /** Checks if the current view's id matches the given id. */
  isViewActive: (id: string) => boolean;
  headerTitle?: string;
  preview: SplitScreenPreview;
  setScreenViewOptions: (
    viewId: ViewInstance["id"],
    options: Partial<Omit<ScreenViewInstance, "id">>
  ) => void;
  setHeaderTitle: (title?: string) => void;
  setPreview: (preview: SplitScreenPreview) => void;
}

/**
 * This hook allows any component to access view navigation methods.
 * Use it whenever you want to navigate between views or show overlays.
 *
 * @example
 * ```
 * const { showView, showActionSheet, hideView } = useViewContext();
 *
 * // Navigate to a view
 * showView('album', { id: 'abc123' });
 *
 * // Show an action sheet
 * showActionSheet({ id: 'options', listOptions: [...] });
 * ```
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
    <TViewId extends ViewId>(
      viewId: TViewId,
      props?: ViewProps[TViewId],
      headerTitle?: string
    ) => {
      const config = VIEW_REGISTRY[viewId];
      if (!config) {
        console.error(`View not found in registry: ${viewId}`);
        return;
      }

      const viewInstance: ScreenViewInstance<TViewId> = {
        type: "screen",
        id: viewId,
        props,
        headerTitle,
      };

      setViewContextState((prevViewState) => ({
        ...prevViewState,
        viewStack: [...prevViewState.viewStack, viewInstance],
        headerTitle: headerTitle ?? config.title ?? viewId,
      }));
    },
    [setViewContextState]
  );

  const showActionSheet = useCallback(
    (options: Omit<ActionSheetInstance, "type">) => {
      const viewInstance: ActionSheetInstance = {
        type: "actionSheet",
        ...options,
      };

      setViewContextState((prevViewState) => ({
        ...prevViewState,
        viewStack: [...prevViewState.viewStack, viewInstance],
      }));
    },
    [setViewContextState]
  );

  const showPopup = useCallback(
    (options: Omit<PopupInstance, "type">) => {
      const viewInstance: PopupInstance = {
        type: "popup",
        ...options,
      };

      setViewContextState((prevViewState) => ({
        ...prevViewState,
        viewStack: [...prevViewState.viewStack, viewInstance],
      }));
    },
    [setViewContextState]
  );

  const showKeyboard = useCallback(
    (options: Omit<KeyboardInstance, "type">) => {
      const viewInstance: KeyboardInstance = {
        type: "keyboard",
        ...options,
      };

      setViewContextState((prevViewState) => ({
        ...prevViewState,
        viewStack: [...prevViewState.viewStack, viewInstance],
      }));
    },
    [setViewContextState]
  );

  const hideView = useCallback(
    (id?: string) => {
      if (viewContextState.viewStack.length === 1) return;
      setViewContextState((prevViewState) => {
        const newViewStack = id
          ? prevViewState.viewStack.filter((view) => view.id !== id)
          : prevViewState.viewStack.slice(0, -1);
        const newTopView = newViewStack[newViewStack.length - 1];

        // Get header title from view
        let headerTitle: string | undefined;
        if (newTopView.type === "screen") {
          const config = VIEW_REGISTRY[newTopView.id as ViewId];
          headerTitle = newTopView.headerTitle ?? config?.title;
        } else if ("headerTitle" in newTopView) {
          headerTitle = newTopView.headerTitle;
        }

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
      const { viewStack } = viewContextState;
      const curView = viewStack[viewStack.length - 1];
      return curView.id === id;
    },
    [viewContextState]
  );

  const setScreenViewOptions = useCallback(
    (
      viewId: ViewInstance["id"],
      options: Partial<Omit<ScreenViewInstance, "id">>
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
    showView,
    showActionSheet,
    showPopup,
    showKeyboard,
    hideView,
    resetViews,
    isViewActive,
    preview: viewContextState.preview,
    viewStack: viewContextState.viewStack,
    headerTitle: viewContextState.headerTitle,
    setScreenViewOptions,
    setHeaderTitle,
    setPreview,
  };
};

export default useViewContext;
