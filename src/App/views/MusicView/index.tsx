import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewOptions from "..";
import { ArtistsView } from "App/views";

const MusicView = () => {
  const options: SelectableListOption[] = [
    {
      label: "Artists",
      value: () => <ArtistsView />,
      viewId: ViewOptions.artists.id
    }
  ];
  const [index] = useScrollHandler(ViewOptions.music.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default MusicView;
