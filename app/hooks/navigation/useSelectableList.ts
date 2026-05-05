import { SelectableListOption } from "@/components";
import { ViewId } from "@/components/views/registry";
import { PopupId, ActionSheetId } from "@/providers/ViewContextProvider";

import useMenuHideView from "./useMenuHideView";
import useScrollHandler from "./useScrollHandler";
import useOptionSelect from "./useOptionSelect";

interface UseSelectableListOptions {
  viewId: ViewId | PopupId | ActionSheetId | "keyboard";
  options: SelectableListOption[];
  selectedOption?: SelectableListOption;
  onNearEndOfList?: (currentLength: number) => void;
  /**
   * Register menu-button-to-hide-view behavior. Default: true.
   * Safe to leave on even for root views (hideView is a no-op when stack length is 1).
   * Set to false for sub-components like BacksideContent that don't own their view lifecycle.
   *
   * This value must be constant for the lifetime of the component (do not derive from state).
   */
  hideOnMenu?: boolean;
}

interface UseSelectableListResult {
  activeIndex: number;
}

const useSelectableList = ({
  viewId,
  options,
  selectedOption,
  onNearEndOfList,
  hideOnMenu = true,
}: UseSelectableListOptions): UseSelectableListResult => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (hideOnMenu) useMenuHideView(viewId);

  const [activeIndex] = useScrollHandler(
    viewId,
    options,
    selectedOption,
    onNearEndOfList
  );

  useOptionSelect({ id: viewId, options, index: activeIndex });

  return { activeIndex };
};

export default useSelectableList;
