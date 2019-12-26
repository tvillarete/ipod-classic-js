import React from "react";
import styled from "styled-components";
import { formatTime } from "utils";
import { Unit } from "components";

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
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

interface Props {
  size: number;
  current: number;
}

const ProgressBar = ({ size, current }: Props) => {
  const percent = Math.round((current / size) * 100);

  return (
    <Container>
      <Label textAlign="left">{formatTime(current)}</Label>
      <ProgressContainer>
        <Gloss />
        <Progress percent={percent} />
      </ProgressContainer>
      <Label textAlign="right">-{formatTime(size - current)}</Label>
    </Container>
  );
};

export default ProgressBar;
