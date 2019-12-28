import React from 'react';

import { AlbumsView, ArtistsView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';

import ViewOptions from '../';

const MusicView = () => {
  const options: SelectableListOption[] = [
    {
      label: "Artists",
      value: () => <ArtistsView />,
      viewId: ViewOptions.artists.id
    },
    {
      label: "Albums",
      value: () => <AlbumsView />,
      viewId: ViewOptions.albums.id
    }
  ];
  const [index] = useScrollHandler(ViewOptions.music.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default MusicView;
