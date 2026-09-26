import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useSelectableList } from "@/hooks";
import { ViewId } from "@/components/views/registry";
import { PopupId, ActionSheetId } from "@/providers/ViewContextProvider";

type ListViewId = ViewId | PopupId | ActionSheetId | "keyboard";

interface SelectableListViewProps {
  viewId: ListViewId;
  options: SelectableListOption[];
  loading?: boolean;
  emptyMessage?: string;
  onNearEndOfList?: () => void;
  loadingNextItems?: boolean;
  renderItem?: (
    option: SelectableListOption,
    index: number,
    isActive: boolean
  ) => React.ReactNode;
}

const SelectableListView = ({
  viewId,
  options,
  loading,
  emptyMessage,
  onNearEndOfList,
  loadingNextItems,
  renderItem,
}: SelectableListViewProps) => {
  const { activeIndex } = useSelectableList({
    viewId,
    options,
    onNearEndOfList,
  });

  return (
    <SelectableList
      loading={loading}
      loadingNextItems={loadingNextItems}
      options={options}
      activeIndex={activeIndex}
      emptyMessage={emptyMessage}
      renderItem={renderItem}
    />
  );
};

export default SelectableListView;
