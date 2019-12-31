import React from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, { BrickGameView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';

const GamesView = () => {
  useMenuHideWindow(ViewOptions.games.id);
  const options: SelectableListOption[] = [
    {
      label: "Brick",
      value: () => <BrickGameView />,
      viewId: ViewOptions.brickGame.id,
      preview: PREVIEW.GAMES
    }
  ];

  const [index] = useScrollHandler(ViewOptions.games.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default GamesView;
