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

interface Props {
  playlists?: IpodApi.Playlist[];
  inLibrary?: boolean;
}

const PlaylistsView = ({ playlists, inLibrary = true }: Props) => {
  useMenuHideWindow(ViewOptions.playlists.id);
  const { isAuthorized } = useSettings();
  const { data: fetchedPlaylists, isLoading } = useDataFetcher<
    IpodApi.Playlist[]
  >({
    name: 'playlists',
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      (playlists ?? fetchedPlaylists)?.map((playlist) => ({
        type: 'View',
        label: playlist.name,
        sublabel: playlist.description || `By ${playlist.curatorName}`,
        imageUrl: playlist.artwork?.url,
        viewId: ViewOptions.playlist.id,
        component: () => (
          <PlaylistView id={playlist.id} inLibrary={inLibrary} />
        ),
        longPressOptions: Utils.getMediaOptions('playlist', playlist.id),
      })) ?? [],
    [fetchedPlaylists, inLibrary, playlists]
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
