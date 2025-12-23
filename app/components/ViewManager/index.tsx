import ActionSheetViewManager from "@/components/ViewManager/ActionSheetViewManager";
import CoverFlowViewManager from "@/components/ViewManager/CoverFlowViewManager";
import FullScreenViewManager from "@/components/ViewManager/FullScreenViewManager";
import KeyboardViewManager from "@/components/ViewManager/KeyboardViewManager";
import PopupViewManager from "@/components/ViewManager/PopupViewManager";
import SplitScreenViewManager from "@/components/ViewManager/SplitScreenViewManager";
import { VIEW_REGISTRY } from "@/components/views/registry";
import { useEventListener, useViewContext } from "@/hooks";
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

const ViewManager = () => {
  const { viewStack, resetViews } = useViewContext();

  const coverFlowView = viewStack.find(
    (view) => view.type === "screen" && view.id === "coverFlow"
  );

  const splitScreenViews = viewStack.filter(
    (view) =>
      view.type === "screen" &&
      view.id !== "coverFlow" &&
      hasSplitScreenPreview(view.id)
  );

  const fullScreenViews = viewStack.filter(
    (view) =>
      view.type === "screen" &&
      view.id !== "coverFlow" &&
      !hasSplitScreenPreview(view.id)
  );

  const actionSheetViews = viewStack.filter(
    (view) => view.type === "actionSheet"
  );
  const popupViews = viewStack.filter((view) => view.type === "popup");
  const keyboardViews = viewStack.filter((view) => view.type === "keyboard");

  useEventListener<IpodEvent>("menulongpress", resetViews);

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
