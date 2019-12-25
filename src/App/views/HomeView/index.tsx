import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { MusicView, ArtistsView, BrickGameView } from "App/views";

const options: SelectableListOption[] = [
  {
    label: "Music",
    value: () => <MusicView />
  },
  {
    label: "Artists",
    value: () => <ArtistsView />
  },
  {
    label: "Brick",
    value: () => <BrickGameView />
  }
];

const HomeView = () => {
  const [index] = useScrollHandler(ViewIds.home, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
