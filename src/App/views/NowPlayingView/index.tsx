import ViewOptions from 'App/views';
import { NowPlaying } from 'components';
import { useMenuHideWindow, useWindowContext } from 'hooks';

const NowPlayingView = () => {
  useMenuHideWindow(ViewOptions.nowPlaying.id);
  const { hideWindow } = useWindowContext();

  return <NowPlaying onHide={hideWindow} />;
};

export default NowPlayingView;
