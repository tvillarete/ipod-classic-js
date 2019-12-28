import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewOptions, { BrickGameView } from "App/views";

const options: SelectableListOption[] = [
  {
    label: "Brick",
    value: () => <BrickGameView />
  }
];

const GamesView = () => {
  const [index] = useScrollHandler(ViewOptions.games.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default GamesView;
