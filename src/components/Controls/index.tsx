import React from 'react';

import { Unit } from 'components';
import { useVolumeHandler } from 'hooks';
import styled from 'styled-components';

import TrackProgress from './TrackProgress';
import VolumeBar from './VolumeBar';

const Container = styled.div`
  width: 100%;
  padding: 0 ${Unit.MD};
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
