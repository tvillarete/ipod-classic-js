import { useCallback, useEffect } from 'react';
import { DIRECTION_MAP } from '../utils/constants';
import { ArrowKey, ArrowKeyType, Vector } from '../utils/types';
import { useMenuHideWindow } from 'hooks';

const isArrowKey = (key: string): key is ArrowKeyType =>
  Object.keys(ArrowKey).includes(key);

// Rather than returning the direction, we pass the direction to the given callback
// so that keydown event won't make React rerender until the callback changes some states
const useArrowKeyPress = (cb: (dir: Vector) => void) => {
  const onKeyDown = useCallback(
    ({ key }: KeyboardEvent) => {
      if (isArrowKey(key)) {
        cb(DIRECTION_MAP[key]);
      }
    },
    [cb],
  );

  const moveUp = ()=>{

    cb({ r: -1, c: 0 })
  }
  const moveDown = () => {
    cb({ r: 1, c: 0 })
  }
  const moveLeft = () => {
    cb({ r: 0, c: -1 })
  }
  const moveRight = () => {
    cb({ r: 0, c: 1 })
  }

  useEffect(() => {
    window.addEventListener('menuclick', moveUp);
    window.addEventListener('playpauseclick', moveDown);
    window.addEventListener('backwardclick', moveLeft);
    window.addEventListener('forwardclick', moveRight);
    return () => {
      window.removeEventListener('menuclick', moveUp);
      window.removeEventListener('playpauseclick', moveDown);
      window.removeEventListener('backwardclick', moveLeft);
      window.removeEventListener('forwardclick', moveRight);
    };
  }, []);
};

export default useArrowKeyPress;
