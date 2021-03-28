import React, { useCallback, useEffect, useState } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

import ViewOptions, { ArtistView } from '../';

const ArtistsView = () => {
  useMenuHideWindow(ViewOptions.artists.id);
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  const handleMount = useCallback(async () => {
    const artists = await music.api.library.artists(null, {
      include: 'catalog',
      limit: 100,
    });

    setOptions(
      artists.map((artist) => ({
        label: artist.attributes?.name ?? 'Unknown artist',
        value: () => (
          <ArtistView id={artist.id} name={artist.attributes?.name ?? ''} />
        ),
        viewId: ViewOptions.artist.id,
      }))
    );

    setLoading(false);
  }, [music]);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  const [index] = useScrollHandler(ViewOptions.artists.id, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default ArtistsView;
