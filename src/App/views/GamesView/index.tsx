import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { BrickGameView } from "App/views";

const options: SelectableListOption[] = [
  {
    label: "Brick",
    value: () => <BrickGameView />
  }
];

const GamesView = () => {
  const [index] = useScrollHandler(ViewIds.games, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default GamesView;
