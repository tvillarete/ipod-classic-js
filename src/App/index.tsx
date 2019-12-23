import { ScrollWheel, Unit } from "components";
import React, { useState, useCallback } from "react";
import styled, { createGlobalStyle } from "styled-components";

enum WHEEL_QUADRANT {
  TOP = 1,
  BOTTOM = 2,
  LEFT = 3,
  RIGHT = 4
}

const GlobalStyles = createGlobalStyle`
   body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
   }
`;

const Container = styled.div`
`;

const Shell = styled.div`
  position: relative;
  height: 100vh;
  max-height: 37em;
  width: 370px;
  border-radius: 30px;
  border: 1px solid gray;
  box-shadow: inset 0 0 2.4em #555;
  background: rgb(225, 225, 225);
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(50%, transparent), to(rgba(250, 250, 250, 0.3)));
`;

const Screen = styled.div`
  position: relative;
  display: flex;
  height: 260px;
  margin: ${Unit.LG} ${Unit.LG} ${Unit.XL};
  border: 4px solid black;
  background: white;
  border-radius: ${Unit.SM};
  overflow: hidden;
  animation: fadeFromBlack 0.5s;

  > div {
    user-select: none;
  }

  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }
`;

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleClockwiseScroll = () => {
    console.log("SCROLL CLOCKWISE");
  };

  const handleCounterClockwiseScroll = () => {
    console.log("SCROLL COUNTER-CLOCKWISE");
  };

  const handleScroll = useCallback(
    (val: number) => {
      if (val === 0 && count === 100) {
        handleClockwiseScroll();
      } else if (val === 100 && count === 0) {
        handleCounterClockwiseScroll();
      } else if (val > count) {
        handleClockwiseScroll();
      } else if (val < count) {
        handleCounterClockwiseScroll();
      }
      setCount(val);
    },
    [count]
  );

  const handleWheelClick = (quadrant: number) => {
    switch (quadrant) {
      case WHEEL_QUADRANT.TOP:
        console.log("CLICKED MENU");
        break;
      case WHEEL_QUADRANT.BOTTOM:
        console.log("CLICKED PLAY/PAUSE");
        break;
      case WHEEL_QUADRANT.LEFT:
        console.log("CLICKED REWIND");
        break;
      case WHEEL_QUADRANT.RIGHT:
        console.log("CLICKED FAST FORWARD");
        break;
    }
  };

  const handleCenterClick = () => {
    console.log("CLICKED CENTER BUTTON");
  };

  return (
    <Container>
      <GlobalStyles />
      <Shell>
        <Screen />
        <ScrollWheel
          value={count}
          min={0}
          max={100}
          width={220}
          height={220}
          step={5}
          fgColor="transparent"
          bgColor={"white"}
          thickness={0.6}
          onClick={handleCenterClick}
          onWheelClick={handleWheelClick}
          onChange={handleScroll}
        />
      </Shell>
    </Container>
  );
};

export default App;
