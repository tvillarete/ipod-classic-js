import { NowPlaying } from "components";
import viewConfigMap from "components/views";
import { useMenuHideView, useViewContext } from "hooks";

const NowPlayingView = () => {
  useMenuHideView(viewConfigMap.nowPlaying.id);
  const { hideView } = useViewContext();

  return <NowPlaying onHide={hideView} />;
};

export default NowPlayingView;
