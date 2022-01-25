import { SelectableList, SelectableListOption } from 'components';
import { PREVIEW } from 'components/previews';
import { BrickGameView, ViewOptions } from 'components/views';
import { useMenuHideWindow, useScrollHandler } from 'hooks';

import WordleView from '../WordleView';

const GamesView = () => {
  useMenuHideWindow(ViewOptions.games.id);
  const options: SelectableListOption[] = [
    {
      type: 'View',
      label: 'Brick',
      viewId: ViewOptions.brickGame.id,
      component: () => <BrickGameView />,
      preview: PREVIEW.GAMES,
    },
    {
      type: 'View',
      label: 'Wordle',
      viewId: ViewOptions.wordle.id,
      component: () => <WordleView />,
      preview: PREVIEW.GAMES,
    },
  ];

  const [scrollIndex] = useScrollHandler(ViewOptions.games.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default GamesView;
