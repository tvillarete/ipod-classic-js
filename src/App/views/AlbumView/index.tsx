import React, { useState, useEffect } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { NowPlayingView } from "App/views";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { Song } from "services/audio";

type AlbumQuery = {
  album: Song[];
};

const ALBUM = gql`
  query Album($name: String!) {
    album(name: $name) {
      id
      name
      artist
      album
      artwork
      track
      url
    }
  }
`;

interface Props {
  name: string;
}

const AlbumView = ({ name }: Props) => {
  const { loading, error, data } = useQuery<AlbumQuery>(ALBUM, {
    variables: { name }
  });
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  useEffect(() => {
    if (data && data.album && !error) {
      setOptions(
        data.album.map(song => ({
          label: song.name,
          value: () => <NowPlayingView song={song} />,
          viewId: ViewIds.nowPlaying,
          song
        }))
      );
    }
  }, [data, error]);

  const [index] = useScrollHandler(ViewIds.album, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default AlbumView;
