import React, { useState, useEffect } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { AlbumView } from "App/views";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

type ArtistQuery = {
  artist: [
    {
      album: string;
      artwork: string;
    }
  ];
};

const ARTIST = gql`
  query Artist($name: String!) {
    artist(name: $name) {
      album
      artwork
    }
  }
`;

const getArtwork = (filePath: string) =>
  `http://tannerv.ddns.net:12345/SpotiFree/${filePath}`;

interface Props {
  name: string;
}

const ArtistView = ({ name }: Props) => {
  const { loading, error, data } = useQuery<ArtistQuery>(ARTIST, {
    variables: { name }
  });
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  useEffect(() => {
    if (data && data.artist && !error) {
      setOptions(
        data.artist.map(result => ({
          label: result.album,
          value: () => <AlbumView name={result.album} />,
          image: getArtwork(result.artwork),
          viewId: "Album"
        }))
      );
    }
  }, [data, error]);

  const [index] = useScrollHandler(ViewIds.artist, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default ArtistView;
