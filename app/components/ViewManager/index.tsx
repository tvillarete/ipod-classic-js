import ActionSheetViewManager from "@/components/ViewManager/ActionSheetViewManager";
import CoverFlowViewManager from "@/components/ViewManager/CoverFlowViewManager";
import FullScreenViewManager from "@/components/ViewManager/FullScreenViewManager";
import KeyboardViewManager from "@/components/ViewManager/KeyboardViewManager";
import PopupViewManager from "@/components/ViewManager/PopupViewManager";
import SplitScreenViewManager from "@/components/ViewManager/SplitScreenViewManager";
import { VIEW_REGISTRY } from "@/components/views/registry";
import { useEventListener, useViewContext } from "@/hooks";
import {
  ViewInstance,
  ScreenViewInstance,
  ActionSheetInstance,
  PopupInstance,
  KeyboardInstance,
} from "@/providers/ViewContextProvider";
import styled from "styled-components";
import { IpodEvent } from "@/utils/events";

/** Prevents the user from scrolling the display with a mouse. */
const Mask = styled.div`
  z-index: 100;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const hasSplitScreenPreview = (viewId: string) => {
  const config = VIEW_REGISTRY[viewId as keyof typeof VIEW_REGISTRY];
  return config?.isSplitScreen ?? false;
};

// Type guard functions
const isScreenView = (view: ViewInstance): view is ScreenViewInstance =>
  view.type === "screen";

const isActionSheetView = (view: ViewInstance): view is ActionSheetInstance =>
  view.type === "actionSheet";

const isPopupView = (view: ViewInstance): view is PopupInstance =>
  view.type === "popup";

const isKeyboardView = (view: ViewInstance): view is KeyboardInstance =>
  view.type === "keyboard";

const ViewManager = () => {
  const { viewStack, resetViews } = useViewContext();

  const screenViews = viewStack.filter(isScreenView);
  const coverFlowView = screenViews.find((view) => view.id === "coverFlow");

  const splitScreenViews = screenViews.filter(
    (view) => view.id !== "coverFlow" && hasSplitScreenPreview(view.id)
  );
  const fullScreenViews = screenViews.filter(
    (view) => view.id !== "coverFlow" && !hasSplitScreenPreview(view.id)
  );

  const actionSheetViews = viewStack.filter(isActionSheetView);
  const popupViews = viewStack.filter(isPopupView);
  const keyboardViews = viewStack.filter(isKeyboardView);

  // Check if the current view has long press disabled
  const currentView = viewStack[viewStack.length - 1];
  const shouldDisableLongPress =
    currentView?.type === "screen" &&
    VIEW_REGISTRY[currentView.id as keyof typeof VIEW_REGISTRY]?.disableLongPress;

  const handleMenuLongPress = () => {
    if (!shouldDisableLongPress) {
      resetViews();
    }
  };

  useEventListener<IpodEvent>("menulongpress", handleMenuLongPress);

  return (
    <div>
      <CoverFlowViewManager view={coverFlowView} />
      <SplitScreenViewManager
        viewStack={splitScreenViews}
        menuHidden={fullScreenViews.length > 0}
        allHidden={!!coverFlowView}
      />
      <FullScreenViewManager viewStack={fullScreenViews} />
      <ActionSheetViewManager viewStack={actionSheetViews} />
      <PopupViewManager viewStack={popupViews} />
      <KeyboardViewManager viewStack={keyboardViews} />
      <Mask />
    </div>
  );
};

export default ViewManager;
