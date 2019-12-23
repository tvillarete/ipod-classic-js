import { ScrollWheel, Unit } from "components";
import React, { useState, useCallback } from "react";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
   body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
   }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Shell = styled.div`
  position: relative;
  height: 38em;
  max-height: 100%;
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

  const handleScroll = useCallback((val: number) => {
    console.log(val);
    setCount(val);
  }, []);

  const handleClick = () => {
    console.log("CLICKED");
  };

  return (
    <Container>
      <GlobalStyles />
      <Shell>
        <Screen />
        <ScrollWheel
          value={count}
          onClick={handleClick}
          min={0}
          max={100}
          width={220}
          height={220}
          step={5}
          fgColor="transparent"
          bgColor={"white"}
          thickness={0.6}
          onChange={handleScroll}
        />
      </Shell>
    </Container>
  );
};

export default App;
