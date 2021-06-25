import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useDataFetcher,
  useMenuHideWindow,
  useScrollHandler,
  useSettings,
} from 'hooks';

import ViewOptions, { ArtistView } from '../';

const ArtistsView = () => {
  useMenuHideWindow(ViewOptions.artists.id);
  const { isAuthorized } = useSettings();
  const { data: artists, isLoading } = useDataFetcher<IpodApi.Artist[]>({
    name: 'artists',
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      artists?.map((artist) => ({
        type: 'View',
        label: artist.name,
        viewId: ViewOptions.artist.id,
        component: () => <ArtistView id={artist.id} inLibrary={true} />,
      })) ?? [],
    [artists]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.artists.id, options);

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No saved artists"
    />
  ) : (
    <AuthPrompt message="Sign in to view your artists" />
  );
};

export default ArtistsView;
