import React, { useMemo } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { ViewOptions } from 'components/views';
import {
  useEffectOnce,
  useKeyboardInput,
  useMenuHideWindow,
  useScrollHandler,
} from 'hooks';

const SearchView = () => {
  useMenuHideWindow(ViewOptions.search.id);
  const { value, showKeyboard } = useKeyboardInput();

  const options: SelectableListOption[] = useMemo(() => {
    const arr: SelectableListOption[] = [
      {
        type: 'Action',
        label: 'Search',
        sublabel: value ? `Results for: ${value}` : 'Enter text to search',
        imageUrl: 'search_icon.svg',
        onSelect: showKeyboard,
      },
    ];

    return arr;
  }, [showKeyboard, value]);

  useEffectOnce(() => {
    showKeyboard();
  });

  const [scrollIndex] = useScrollHandler(ViewOptions.search.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SearchView;
