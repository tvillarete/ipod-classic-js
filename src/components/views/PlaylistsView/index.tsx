import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useDataFetcher,
  useMenuHideWindow,
  useScrollHandler,
  useSettings,
} from 'hooks';
import * as Utils from 'utils';

import ViewOptions, { PlaylistView } from '../';

const PlaylistsView = () => {
  useMenuHideWindow(ViewOptions.playlists.id);
  const { isAuthorized } = useSettings();
  const { data, isLoading } = useDataFetcher<IpodApi.Playlist[]>({
    name: 'playlists',
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      data?.map((playlist) => ({
        type: 'View',
        label: playlist.name,
        sublabel: playlist.description || `By ${playlist.curatorName}`,
        imageUrl: playlist.artwork?.url,
        viewId: ViewOptions.playlist.id,
        component: () => <PlaylistView id={playlist.id} inLibrary />,
        longPressOptions: Utils.getMediaOptions('playlist', playlist.id),
      })) ?? [],
    [data]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.playlists.id, options);

  return isAuthorized ? (
    <SelectableList
      loading={isLoading}
      options={options}
      activeIndex={scrollIndex}
      emptyMessage="No saved playlists"
    />
  ) : (
    <AuthPrompt message="Sign in to view your playlists" />
  );
};

export default PlaylistsView;
