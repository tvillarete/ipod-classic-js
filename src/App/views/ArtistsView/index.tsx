import React, { useState, useEffect } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds, { ArtistView } from "..";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

type ArtistsQuery = {
  artists: [
    {
      artist: string;
    }
  ];
};

const ARTISTS = gql`
  {
    artists {
      artist
    }
  }
`;

const ArtistsView = () => {
  const { loading, error, data } = useQuery<ArtistsQuery>(ARTISTS);
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  useEffect(() => {
    if (data && data.artists && !error) {
      setOptions(
        data.artists.map(result => ({
          label: result.artist,
          value: () => <ArtistView name={result.artist} />
        }))
      );
    }
  }, [data, error]);

  const [index] = useScrollHandler(ViewIds.artists, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default ArtistsView;
