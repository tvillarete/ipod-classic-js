import NowPlaying from "@/components/NowPlaying";
import { useMenuHideView, useViewContext } from "@/hooks";

const NowPlayingView = () => {
  useMenuHideView("nowPlaying");
  const { hideView } = useViewContext();

  return <NowPlaying onHide={hideView} />;
};

export default NowPlayingView;
