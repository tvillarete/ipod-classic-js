import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useSelectableList } from "@/hooks";
type ListViewId = string;

interface SelectableListViewProps {
  viewId: ListViewId;
  options: SelectableListOption[];
  loading?: boolean;
  emptyMessage?: string;
  emptyContent?: React.ReactNode;
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
  emptyContent,
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
      emptyContent={emptyContent}
      renderItem={renderItem}
    />
  );
};

export default SelectableListView;
