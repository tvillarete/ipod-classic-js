import { createContext, useState } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { ViewId, ViewProps, VIEW_REGISTRY } from "@/components/views/registry";

/**
 * Known popup IDs used throughout the app.
 */
export type PopupId =
  | "spotifyNotSupported"
  | "spotifyNonPremium"
  | "musicProviderError";

/**
 * Known action sheet IDs used throughout the app.
 */
export type ActionSheetId =
  | "media-action-sheet"
  | "signin-popup"
  | "device-theme-action-sheet"
  | "service-type-action-sheet"
  | "sign-out-popup"
  | "shuffle-mode-action-sheet"
  | "repeat-mode-action-sheet"
  | "haptics-action-sheet";

/**
 * Screen view instance - references a view in the registry
 */
export type ScreenViewInstance<TViewId extends ViewId = ViewId> = {
  type: "screen";
  id: TViewId;
  props?: ViewProps[TViewId];
  headerTitle?: string;
  onClose?: (..._args: any[]) => void;
  styles?: Record<string, any>;
};

/**
 * Action sheet instance - dynamic overlay with list options
 */
export type ActionSheetInstance = {
  type: "actionSheet";
  id: ActionSheetId;
  listOptions: SelectableListOption[];
  headerTitle?: string;
  onClose?: (..._args: any[]) => void;
};

/**
 * Popup instance - dynamic overlay with title, description, and options
 */
export type PopupInstance = {
  type: "popup";
  id: PopupId;
  title: string;
  description?: string;
  listOptions: SelectableListOption[];
  onClose?: (..._args: any[]) => void;
};

/**
 * Keyboard instance - text input overlay
 */
export type KeyboardInstance = {
  type: "keyboard";
  id: "keyboard";
  initialValue?: string;
  onClose?: (..._args: any[]) => void;
};

/**
 * CoverFlow instance - special album browsing view
 */
export type CoverFlowInstance = {
  type: "coverFlow";
  id: string;
  onClose?: (..._args: any[]) => void;
};

/**
 * Union of all possible view instances
 */
export type ViewInstance =
  | ScreenViewInstance
  | ActionSheetInstance
  | PopupInstance
  | KeyboardInstance
  | CoverFlowInstance;

interface ViewContextState {
  viewStack: ViewInstance[];
  headerTitle?: string;
  preview: SplitScreenPreview;
}

type ViewContextStateType = [
  ViewContextState,
  React.Dispatch<React.SetStateAction<ViewContextState>>,
];

export const ViewContext = createContext<ViewContextStateType>([
  {
    viewStack: [],
    headerTitle: "iPod.js",
    preview: SplitScreenPreview.Music,
  },
  () => {},
]);

interface Props {
  children: React.ReactNode;
}

const ViewContextProvider = ({ children }: Props) => {
  const baseView: ScreenViewInstance<"home"> = {
    type: "screen",
    id: "home",
  };

  const viewStack: ViewInstance[] = [baseView];
  const [viewContextState, setViewContextState] = useState<ViewContextState>({
    viewStack,
    headerTitle: VIEW_REGISTRY.home.title,
    preview: SplitScreenPreview.Music,
  });

  return (
    <ViewContext.Provider value={[viewContextState, setViewContextState]}>
      {children}
    </ViewContext.Provider>
  );
};

export default ViewContextProvider;
