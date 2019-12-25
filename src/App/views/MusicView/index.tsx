import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds from "..";
import { ArtistsView } from "App/views";

const options: SelectableListOption[] = [
  {
    label: "Artists",
    value: () => <ArtistsView />
  }
];

const MusicView = () => {
  const [index] = useScrollHandler(ViewIds.music, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default MusicView;
