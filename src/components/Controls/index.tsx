import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import ProgressBar from "./ProgressBar";
import { useInterval } from "hooks";
import { useAudioService } from "services/audio";

const Container = styled.div`
  width: 100%;
`;

const Controls = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const { playing } = useAudioService();

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

  /** Update the progress bar every second. */
  useInterval(() => refresh(), 1000);

  useEffect(() => refresh(true), [refresh]);

  return (
    <Container>
      <ProgressBar size={maxTime} current={currentTime} />
    </Container>
  );
};

export default Controls;
