import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { ALBUMS, AlbumsQuery } from 'queries';
import { getUrlFromPath } from 'utils';

import ViewOptions, { AlbumView } from '../';

const AlbumsView = () => {
  const { loading, error, data } = useQuery<AlbumsQuery>(ALBUMS);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.albums.id, options);

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

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default AlbumsView;
