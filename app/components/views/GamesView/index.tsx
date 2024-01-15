import { SelectableList, SelectableListOption } from "components";
import { SplitScreenPreview } from "components/previews";
import { BrickGameView, viewConfigMap } from "components/views";
import { useMenuHideView, useScrollHandler } from "hooks";

const GamesView = () => {
  useMenuHideView(viewConfigMap.games.id);
  const options: SelectableListOption[] = [
    {
      type: "view",
      label: "Brick",
      viewId: viewConfigMap.brickGame.id,
      component: () => <BrickGameView />,
      preview: SplitScreenPreview.Games,
    },
  ];

  const [scrollIndex] = useScrollHandler(viewConfigMap.games.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default GamesView;
