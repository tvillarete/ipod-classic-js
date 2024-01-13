import { useEffect, useRef } from "react";

const useInterval = (
  callback: (...args: any) => any,
  delay: number,
  /** If true, will not run the callback. */
  skip?: boolean
) => {
  const intervalRef = useRef<number>();
  const savedCallback = useRef(callback);
  const skipRef = useRef<boolean>(skip ?? false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    skipRef.current = skip ?? false;
  }, [skip]);

  useEffect(() => {
    const tick = () => {
      if (skipRef.current) {
        return;
      }
      savedCallback.current();
    };

    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);

  return intervalRef;
};

export default useInterval;
