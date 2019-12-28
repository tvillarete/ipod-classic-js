import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewOptions, { BrickGameView } from "App/views";

const GamesView = () => {
  const options: SelectableListOption[] = [
    {
      label: "Brick",
      value: () => <BrickGameView />,
      viewId: ViewOptions.brickGame.id
    }
  ];

  const [index] = useScrollHandler(ViewOptions.games.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default GamesView;
