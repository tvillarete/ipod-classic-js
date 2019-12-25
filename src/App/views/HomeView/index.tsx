import React from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { MusicView, ArtistsView } from "App/views";

const options: SelectableListOption[] = [
  {
    label: "Music",
    value: () => MusicView()
  },
  {
    label: "Artists",
    value: () => ArtistsView()
  },
  {
    label: "Artists1",
    value: () => ArtistsView()
  },
  {
    label: "Artists2",
    value: () => ArtistsView()
  },
  {
    label: "Artists3",
    value: () => ArtistsView()
  },
  {
    label: "Artists4",
    value: () => ArtistsView()
  },
  {
    label: "Artists5",
    value: () => ArtistsView()
  },
  {
    label: "Artist6",
    value: () => ArtistsView()
  },
  {
    label: "Artist7",
    value: () => ArtistsView()
  },
  {
    label: "Artist8",
    value: () => ArtistsView()
  },
  {
    label: "Artist9",
    value: () => ArtistsView()
  },
  {
    label: "Artists10",
    value: () => ArtistsView()
  },
];

const HomeView = () => {
  const [index] = useScrollHandler(ViewIds.home, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
