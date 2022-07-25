import { useMemo } from 'react';

import { AuthPrompt, SelectableList, SelectableListOption } from 'components';
import {
  useFetchArtists,
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
  const {
    data: fetchedArtists,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isQueryLoading,
  } = useFetchArtists({
    lazy: !!artists,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const data =
      artists ?? fetchedArtists?.pages.flatMap((page) => page?.data ?? []);

    return (
      data?.map((artist) => ({
        type: 'View',
        headerTitle: artist.name,
        label: artist.name,
        viewId: ViewOptions.artist.id,
        imageUrl: showImages
          ? Utils.getArtwork(50, artist.artwork?.url) ?? 'artists_icon.svg'
          : '',
        component: () => <ArtistView id={artist.id} inLibrary={inLibrary} />,
      })) ?? []
    );
  }, [artists, fetchedArtists, inLibrary, showImages]);

  // If accessing ArtistsView from the SearchView, and there is no data cached,
  // 'isQueryLoading' will be true. To prevent an infinite loading screen in these
  // cases, we'll check if we have any 'options'
  const isLoading = !options.length && isQueryLoading;

  const [scrollIndex] = useScrollHandler(
    ViewOptions.artists.id,
    options,
    undefined,
    fetchNextPage
  );

  return isAuthorized ? (
    <SelectableList
      activeIndex={scrollIndex}
      emptyMessage="No saved artists"
      loading={isLoading}
      loadingNextItems={isFetchingNextPage}
      options={options}
    />
  ) : (
    <AuthPrompt message="Sign in to view your artists" />
  );
};

export default ArtistsView;
