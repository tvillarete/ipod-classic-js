import React from "react";
import styled from "styled-components";
import TrackProgress from "./TrackProgress";
import VolumeBar from "./VolumeBar";
import { useVolumeHandler } from "hooks";

const Container = styled.div`
  width: 100%;
`;

const Controls = () => {
  const { volume, active } = useVolumeHandler();

  return (
    <Container>
      {active ? <VolumeBar percent={volume} /> : <TrackProgress />}
    </Container>
  );
};

export default Controls;
