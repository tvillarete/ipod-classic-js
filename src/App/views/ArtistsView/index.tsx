import React, { useState, useEffect } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewOptions, { ArtistView } from "..";
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
          viewId: ViewOptions.artist.id,
          value: () => <ArtistView name={result.artist} />
        }))
      );
    }
  }, [data, error]);

  const [index] = useScrollHandler(ViewOptions.artists.id, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default ArtistsView;
