import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import ViewOptions, { NowPlayingView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { ALBUM, AlbumQuery } from 'queries';

interface Props {
  name: string;
}

const AlbumView = ({ name }: Props) => {
  const { loading, error, data } = useQuery<AlbumQuery>(ALBUM, {
    variables: { name }
  });
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.album.id, options);

  useEffect(() => {
    if (data && data.album && !error) {
      setOptions(
        data.album.map((song, index) => ({
          label: song.name,
          value: () => <NowPlayingView />,
          viewId: ViewOptions.nowPlaying.id,
          songIndex: index,
          playlist: data.album
        }))
      );
    }
  }, [data, error]);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default AlbumView;
