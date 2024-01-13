import { AnimatePresence } from "framer-motion";
import { ViewOptions } from "providers/ViewContextProvider";
import styled from "styled-components";

import KeyboardInput from "../components/KeyboardInput";

const RootContainer = styled.div`
  z-index: 4;
  position: absolute;
  height: 100%;
  width: 100%;
`;

interface Props {
  viewStack: ViewOptions[];
}

const KeyboardViewManager = ({ viewStack }: Props) => {
  const isHidden = viewStack.length === 0;

  return (
    <RootContainer data-stack-type="keyboard">
      <AnimatePresence>
        {viewStack.map((view, index) => (
          <KeyboardInput
            key={`keyboard-${view.id}`}
            viewStack={viewStack}
            index={index}
            isHidden={index < viewStack.length - 1}
          />
        ))}
      </AnimatePresence>
    </RootContainer>
  );
};

export default KeyboardViewManager;
