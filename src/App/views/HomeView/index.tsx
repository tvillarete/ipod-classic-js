import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { MusicView, ArtistsView, GamesView } from "App/views";

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
    label: "Games",
    value: () => <GamesView />
  }
];

const HomeView = () => {
  const [index] = useScrollHandler(ViewIds.home, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
