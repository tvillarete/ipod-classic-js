import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useDataFetcher,
  useMenuHideWindow,
  useScrollHandler,
  useSettings,
} from 'hooks';
import * as Utils from 'utils';

import ViewOptions, { ArtistView } from '../';

interface Props {
  artists?: IpodApi.Artist[];
  inLibrary?: boolean;
  showImages?: boolean;
}

const ArtistsView = ({
  artists,
  inLibrary = true,
  showImages = false,
}: Props) => {
  useMenuHideWindow(ViewOptions.artists.id);
  const { isAuthorized } = useSettings();
  const { data: fetchedArtists, isLoading } = useDataFetcher<IpodApi.Artist[]>({
    name: 'artists',
    lazy: !!artists,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      (artists ?? fetchedArtists)?.map((artist) => ({
        type: 'View',
        label: artist.name,
        viewId: ViewOptions.artist.id,
        imageUrl: showImages
          ? Utils.getArtwork(50, artist.artwork?.url) ?? 'artists_icon.svg'
          : '',
        component: () => <ArtistView id={artist.id} inLibrary={inLibrary} />,
      })) ?? [],
    [artists, fetchedArtists, inLibrary, showImages]
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
