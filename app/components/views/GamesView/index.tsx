import { defineView } from "@/components/views/defineView";
import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";

const _GamesView = () => {
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

  return <SelectableListView viewId="games" options={options} />;
};

export const GamesView = Object.assign(_GamesView, {
  viewConfig: defineView({
    component: _GamesView,
    type: "split",
    title: "Games",
    isSplitScreen: true,
    preview: SplitScreenPreview.Games,
  }),
});

