import React from 'react';

import { noAnimation, slideRightAnimation } from 'animation';
import { motion } from 'framer-motion';
import { useWindowService, WindowOptions } from 'services/window';
import styled from 'styled-components';

interface ContainerProps {
  index: number;
  showHeader: boolean;
}

/** Responsible for putting the window at the proper z-index. */
export const Container = styled(motion.div)<ContainerProps>`
  z-index: ${(props) => props.index};
  position: absolute;
  top: ${(props) => (props.showHeader ? '20px' : 0)};
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
`;

interface ContentTransitionContainerProps {
  isHidden: boolean;
}

/** Slides the view to the left if it isn't at the top of the stack. */
const ContentTransitionContainer = styled.div<ContentTransitionContainerProps>`
  height: 100%;
  transition: transform 0.3s;
  transform: ${(props) => props.isHidden && 'translateX(-100%)'};
  overflow: auto;
`;

interface Props {
  windowStack: WindowOptions[];
  index: number;
  isHidden: boolean;
}

const Window = ({ windowStack, index, isHidden }: Props) => {
  const { headerTitle } = useWindowService();
  const options = windowStack[index];
  const firstInStack = index === 0;

  return (
    <Container
      data-window-id={options.id}
      index={index}
      showHeader={!!headerTitle}
      {...(firstInStack ? noAnimation : slideRightAnimation)}
    >
      <ContentTransitionContainer isHidden={isHidden}>
        <options.component />
      </ContentTransitionContainer>
    </Container>
  );
};

export default Window;
