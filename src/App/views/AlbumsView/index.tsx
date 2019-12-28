import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { getUrlFromPath } from 'utils';

import ViewOptions, { AlbumView } from '../';

type AlbumsQuery = {
  albums: [
    {
      artist: string;
      album: string;
      artwork: string;
    }
  ];
};

const ALBUMS = gql`
  {
    albums {
      artist
      album
      artwork
    }
  }
`;

const AlbumsView = () => {
  const { loading, error, data } = useQuery<AlbumsQuery>(ALBUMS);
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  useEffect(() => {
    if (data && data.albums && !error) {
      setOptions(
        data.albums.map(result => ({
          label: result.album,
          value: () => <AlbumView name={result.album} />,
          image: getUrlFromPath(result.artwork),
          viewId: ViewOptions.album.id
        }))
      );
    }
  }, [data, error]);

  const [index] = useScrollHandler(ViewOptions.albums.id, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default AlbumsView;
