import { AnimatePresence } from "framer-motion";
import { ViewOptions } from "providers/ViewContextProvider";
import styled from "styled-components";

import Popup from "../components/Popup";

interface ContainerProps {
  $isHidden: boolean;
}

const RootContainer = styled.div<ContainerProps>`
  z-index: 4;
  position: absolute;
  height: 100%;
  width: 100%;
  background: ${({ $isHidden }) =>
    $isHidden ? "transparent" : "rgba(0, 0, 0, 0.3)"};
  transition: all 0.25s ease;
`;

interface Props {
  viewStack: ViewOptions[];
}

const PopupViewManager = ({ viewStack }: Props) => {
  const isHidden = viewStack.length === 0;

  return (
    <RootContainer data-stack-type="popup" $isHidden={isHidden}>
      <AnimatePresence>
        {viewStack.map((view, index) => (
          <Popup
            key={`view-${view.id}`}
            viewStack={viewStack}
            index={index}
            isHidden={index < viewStack.length - 1}
          />
        ))}
      </AnimatePresence>
    </RootContainer>
  );
};

export default PopupViewManager;
