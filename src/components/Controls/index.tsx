import { useCallback, useState } from 'react';

import { useEventListener, useVolumeHandler } from 'hooks';
import styled from 'styled-components';
import { Unit } from 'utils/constants';

import Scrubber from './Scrubber';
import TrackProgress from './TrackProgress';
import VolumeBar from './VolumeBar';
import { IpodEvent } from 'utils/events';

const Container = styled.div`
  position: relative;
  width: 100%;
  padding: 0 ${Unit.MD} ${Unit.MD};
`;

interface ContainerProps {
  isHidden: boolean;
}

const MainContainer = styled.div<ContainerProps>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${Unit.XS};
  right: ${Unit.XS};
  transition: transform 0.3s;

  transform: ${(props) => props.isHidden && 'translateX(-110%)'};
`;

const ScrubberContainer = styled.div<ContainerProps>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${Unit.XS};
  right: ${Unit.XS};
  transition: transform 0.3s;

  transform: ${(props) => props.isHidden && 'translateX(110%)'};
`;

const Controls = () => {
  const { volume, active, setEnabled } = useVolumeHandler();
  const [isScrubbing, setIsScrubbing] = useState(false);

  const handleCenterClick = useCallback(() => {
    if (isScrubbing) {
      // Enable the volume controls.
      setEnabled(true);
      setIsScrubbing(false);
    } else {
      // Disable the volume controls.
      setEnabled(false);
      setIsScrubbing(true);
    }
  }, [isScrubbing, setEnabled]);

  useEventListener<IpodEvent>('centerclick', handleCenterClick);

  return (
    <Container>
      <MainContainer isHidden={isScrubbing}>
        {active && !isScrubbing && <VolumeBar percent={volume * 100} />}
      </MainContainer>
      <MainContainer hidden={active && !isScrubbing} isHidden={isScrubbing}>
        <TrackProgress />
      </MainContainer>
      <ScrubberContainer isHidden={!isScrubbing}>
        <Scrubber isScrubbing={isScrubbing} />
      </ScrubberContainer>
    </Container>
  );
};

export default Controls;
