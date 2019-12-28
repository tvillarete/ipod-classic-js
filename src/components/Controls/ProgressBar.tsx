import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { formatTime } from "utils";
import { Unit, LoadingIndicator } from "components";
import { useAudioService } from "services/audio";
import { useInterval } from "hooks";

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
  width: 35px;
  text-align: ${props => props.textAlign};
`;

const ProgressContainer = styled.div`
  position: relative;
  flex: 1;
  margin: 0 8px;
`;

const Gloss = styled.div`
  position: absolute;
  width: 100%;
  background: url("gloss-overlay.svg") repeat-x;
  background-size: contain;
  height: 100%;
`;

interface ProgressProps {
  percent: number;
}

const Progress = styled.div<ProgressProps>`
  width: ${props => props.percent}%;
  height: 100%;
  background: url("gloss-blue.svg") repeat-x;
  transition: width 0.1s;
`;

const ProgressBar = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const { playing, loading } = useAudioService();
  const percent = Math.round((currentTime / maxTime) * 100);

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
      <ProgressContainer>
        <Gloss />
        <Progress percent={loading ? 0 : percent} />
      </ProgressContainer>
      <Label textAlign="right">-{formatTime(maxTime - currentTime)}</Label>
    </Container>
  );
};

export default ProgressBar;
