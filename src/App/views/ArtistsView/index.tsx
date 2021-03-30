import { useCallback, useEffect, useState } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';

import ViewOptions, { ArtistView } from '../';

const ArtistsView = () => {
  useMenuHideWindow(ViewOptions.artists.id);
  const { music, isAuthorized } = useMusicKit();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  const handleMount = useCallback(async () => {
    setLoading(true);
    const artists = await music.api.library.artists(null, {
      include: 'catalog',
      limit: 100,
    });

    setOptions(
      artists.map((artist) => ({
        type: 'View',
        label: artist.attributes?.name ?? 'Unknown artist',
        viewId: ViewOptions.artist.id,
        component: () => <ArtistView id={artist.id} inLibrary={true} />,
      }))
    );

    setLoading(false);
  }, [music]);

  useEffect(() => {
    if (isAuthorized) {
      handleMount();
    }
  }, [handleMount, isAuthorized]);

  const [scrollIndex] = useScrollHandler(ViewOptions.artists.id, options);

  return isAuthorized ? (
    <SelectableList
      loading={loading}
      options={options}
      activeIndex={scrollIndex}
    />
  ) : (
    <AuthPrompt />
  );
};

export default ArtistsView;
