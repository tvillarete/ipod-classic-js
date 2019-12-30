import React, { useCallback, useEffect, useState } from 'react';

import { LoadingIndicator, Unit } from 'components';
import { useEventListener, useInterval } from 'hooks';
import { useAudioService } from 'services/audio';
import styled from 'styled-components';
import { formatTime } from 'utils';

import ProgressBar from './ProgressBar';

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
`;

const LoadingContainer = styled.div`
  position: relative;
  width: 24px;
`;

interface LabelProps {
  textAlign: "left" | "right";
}

const Label = styled.h3<LabelProps>`
  font-size: 12px;
  margin: auto 0;
  width: 30px;
  text-align: ${props => props.textAlign};
`;

interface Props {
  isScrubbing: boolean;
}

const Scubber = ({ isScrubbing }: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const { playing, loading } = useAudioService();
  const percent = Math.round((currentTime / maxTime) * 100);

  const scrubForward = useCallback(() => {
    if (currentTime === maxTime || !isScrubbing) return;
    const audio = document.getElementById("ipodAudio") as HTMLAudioElement;
    const newTime = currentTime + 1;

    if (newTime < maxTime) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, isScrubbing, maxTime]);

  const scrubBackward = useCallback(() => {
    if (currentTime === 0 || !isScrubbing) return;
    const audio = document.getElementById("ipodAudio") as HTMLAudioElement;
    const newTime = currentTime - 1;

    if (newTime >= 0) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, isScrubbing]);

  const refresh = useCallback(
    (force?: boolean) => {
      if (playing || force) {
        const audio = document.getElementById("ipodAudio") as HTMLAudioElement;
        setCurrentTime(audio.currentTime);
        setMaxTime(audio.duration);
      }
    },
    [playing]
  );

  useEventListener("forwardscroll", scrubForward);
  useEventListener("backwardscroll", scrubBackward);

  /** Update the progress bar every second. */
  useInterval(refresh, 1000);

  useEffect(() => refresh(true), [refresh]);

  return (
    <Container>
      {loading ? (
        <LoadingContainer>
          <LoadingIndicator size={14} />
        </LoadingContainer>
      ) : (
        <Label textAlign="left">{formatTime(currentTime)}</Label>
      )}
      <ProgressBar percent={loading ? 0 : percent} isScrubber />
      <Label textAlign="right">-{formatTime(maxTime - currentTime)}</Label>
    </Container>
  );
};

export default Scubber;
