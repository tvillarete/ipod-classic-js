import styled from "styled-components";
import { Unit } from "utils/constants";

import ProgressBar from "./ProgressBar";
import { APP_URL } from "utils/constants/api";

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
`;

const Icon = styled.img`
  font-size: 12px;
  margin: auto 0;
  width: 30px;
  height: 16px;
`;

interface Props {
  percent: number;
}

const VolumeBar = ({ percent }: Props) => {
  return (
    <Container>
      <Icon src={`${APP_URL}/volume_mute.svg`} />
      <ProgressBar percent={percent} />
      <Icon src={`${APP_URL}/volume_full.svg`} />
    </Container>
  );
};

export default VolumeBar;
