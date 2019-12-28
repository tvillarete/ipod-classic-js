import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import ViewOptions, { AlbumView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { ARTIST, ArtistQuery } from 'queries';
import { getUrlFromPath } from 'utils';

interface Props {
  name: string;
}

const ArtistView = ({ name }: Props) => {
  const { loading, error, data } = useQuery<ArtistQuery>(ARTIST, {
    variables: { name }
  });
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.artist.id, options);

  useEffect(() => {
    if (data && data.artist && !error) {
      setOptions(
        data.artist.map(result => ({
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

export default ArtistView;
