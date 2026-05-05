import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useSelectableList } from "@/hooks";

const GamesView = () => {
  const options: SelectableListOption[] = [
    {
      type: "view",
      label: "Brick",
      viewId: "brickGame",
      preview: SplitScreenPreview.Games,
    },
    {
      type: "view",
      label: "Solitaire",
      viewId: "solitaireGame",
      preview: SplitScreenPreview.Games,
    },
  ];

  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "games", options });

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default GamesView;
