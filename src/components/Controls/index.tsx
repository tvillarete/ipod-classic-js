import React from "react";
import styled from "styled-components";
import ProgressBar from "./ProgressBar";

const Container = styled.div`
  width: 100%;
`;

const Controls = () => {
  return (
    <Container>
      <ProgressBar />
    </Container>
  );
};

export default Controls;
