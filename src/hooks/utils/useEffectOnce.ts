import { useEffect } from 'react';

/**
 * Run an effect only once upon component mount/unmount.
 */
const useEffectOnce = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);

export default useEffectOnce;
