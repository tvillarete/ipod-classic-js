import React, { useState, useEffect } from "react";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import ViewIds from "..";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

type AlbumQuery = {
  album: [
    {
      id: string;
      name: string;
    }
  ];
};

const ALBUM = gql`
  query Album($name: String!) {
    album(name: $name) {
      id
      name 
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
        data.album.map(result => ({
          label: result.name,
          value: "Artist",
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
