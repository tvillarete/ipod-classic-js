import React, { useCallback, useMemo, useState } from 'react';

import {
  ArtistsView,
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from 'components';
import { ViewOptions } from 'components/views';
import {
  useDataFetcher,
  useEffectOnce,
  useKeyboardInput,
  useMenuHideWindow,
  useScrollHandler,
} from 'hooks';
import pluralize from 'pluralize';

const SearchView = () => {
  useMenuHideWindow(ViewOptions.search.id);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    fetch,
    data: searchResults,
    isLoading,
  } = useDataFetcher<IpodApi.SearchResults>({
    name: 'search',
    query: searchTerm,
    lazy: true,
  });

  console.log({ searchResults });

  const handleEnterPress = useCallback(() => {
    if (searchTerm) {
      fetch();
    }
  }, [fetch, searchTerm]);

  const { showKeyboard } = useKeyboardInput({
    onChange: (value) => setSearchTerm(value),
    onEnterPress: handleEnterPress,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const artists = searchResults?.artists;

    const arr: SelectableListOption[] = [
      {
        type: 'Action',
        label: 'Search',
        sublabel: searchTerm
          ? `Results for: ${searchTerm}`
          : 'Enter text to search',
        imageUrl: 'search_icon.svg',
        onSelect: showKeyboard,
      },
      ...getConditionalOption(!!artists, {
        type: 'View',
        label: 'Artists',
        viewId: ViewOptions.artists.id,
        component: () => <ArtistsView />,
        sublabel: `${artists!.length} ${pluralize('artist', artists!.length)}`,
      }),
    ];

    return arr;
  }, [searchResults?.artists, searchTerm, showKeyboard]);

  useEffectOnce(() => {
    showKeyboard();
  });

  const [scrollIndex] = useScrollHandler(ViewOptions.search.id, options);

  return (
    <SelectableList
      options={options}
      activeIndex={scrollIndex}
      loading={isLoading}
    />
  );
};

export default SearchView;
