import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds from "..";

const options: SelectableListOption[] = [
  {
    label: "Hi",
    value: () => ArtistsView()
  }
];

const ArtistsView = () => {
  const [index] = useScrollHandler(ViewIds.artists, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default ArtistsView;
