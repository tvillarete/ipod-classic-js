import { useCallback, useEffect, useRef, useState } from 'react';

import { useInterval } from 'hooks';
import styled from 'styled-components';

const Container = styled.div``;

interface ImageProps {
  zIndex: number;
  startedAnimation: boolean;
  isHidden: boolean;
}

const Image = styled.img<ImageProps>`
  z-index: ${(props) => props.zIndex};
  position: absolute;
  height: 100%;
  right: 0;
  animation: ${(props) => props.startedAnimation && 'kenBurns'} 20s;
  opacity: ${(props) => props.isHidden && 0};
  transition: opacity 2s;

  @keyframes kenBurns {
    0% {
      transform: translateX(0%);
    }

    100% {
      transform: translateX(10%);
    }
  }
`;

interface Props {
  urls: string[];
}

const KenBurns = ({ urls }: Props) => {
  const [stack, setStack] = useState<string[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const timeoutIdRef = useRef<any>();

  useEffect(() => {
    setStack(urls);
  }, [urls]);

  /** Move the currently displayed image to the bottom of the stack. */
  const cycleImage = useCallback(() => {
    setTransitioning(true);

    timeoutIdRef.current = setTimeout(() => {
      const newStack = stack.slice(1);

      setStack([...newStack, stack[0]]);
      setTransitioning(false);
    }, 2000);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [stack]);

  /** Cycle through an image every 5 seconds. */
  useInterval(cycleImage, 5000);

  return (
    <Container>
      {stack.slice(0, 2).map((path, index) => (
        <Image
          key={`ken-burns-${path}`}
          zIndex={3 - index}
          src={path}
          startedAnimation={index === 0 || transitioning}
          isHidden={transitioning && index === 0}
        />
      ))}
    </Container>
  );
};

export default KenBurns;
