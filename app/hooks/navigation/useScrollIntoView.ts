import { useEffect, useRef, useState } from "react";
import { useTimeout } from "@/hooks";

interface UseScrollIntoViewOptions {
  activeIndex: number;
  itemCount: number;
  /**
   * Delay before enabling scroll-into-view (avoids interrupting enter animations).
   * Set to 0 or omit to scroll immediately with no delay.
   * @default 0
   */
  mountDelay?: number;
  /** If true, also scroll the next item into view (for pagination indicators). */
  scrollNextItem?: boolean;
}

const useScrollIntoView = ({
  activeIndex,
  itemCount,
  mountDelay = 0,
  scrollNextItem = false,
}: UseScrollIntoViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(mountDelay === 0);

  useTimeout(
    () => setIsMounted(true),
    mountDelay || 0
  );

  useEffect(() => {
    if (isMounted && containerRef.current && itemCount) {
      const { children } = containerRef.current;
      if (scrollNextItem) {
        children[activeIndex + 1]?.scrollIntoView({ block: "nearest" });
      } else {
        children[activeIndex]?.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isMounted, itemCount, scrollNextItem]);

  return containerRef;
};

export default useScrollIntoView;
