import NowPlaying from "@/components/NowPlaying";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import { useMenuHideView, useViewContext } from "@/hooks";

const _NowPlayingView = () => {
  useMenuHideView("nowPlaying");
  const { hideView } = useViewContext();

  return <NowPlaying onHide={hideView} />;
};

export const NowPlayingView = Object.assign(_NowPlayingView, {
  viewConfig: defineView({
    component: _NowPlayingView,
    type: "full",
    title: "Now Playing",
    preview: SplitScreenPreview.Music,
  }),
});
