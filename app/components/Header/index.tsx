import BatteryIndicator from "components/BatteryIndicator";
import LoadingIndicator from "components/LoadingIndicator";
import { useAudioPlayer, useViewContext } from "hooks";
import styled from "styled-components";
import { APP_URL } from "utils/constants/api";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
  height: 20px;
  background: linear-gradient(180deg, #feffff 0%, #b1b6b9 100%);
  border-bottom: 1px solid #7995a3;
  box-sizing: border-box;
`;

const Text = styled.h3`
  margin: 0;
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const IconContainer = styled.div`
  display: flex;
`;

const Icon = styled.img`
  max-height: 12px;
  margin-left: 8px;
`;

const StyledBatteryIndicator = styled(BatteryIndicator)`
  margin-left: 8px;
`;

const Header = () => {
  const { headerTitle } = useViewContext();
  const { playbackInfo } = useAudioPlayer();

  const { isPlaying, isPaused, isLoading } = playbackInfo;

  return headerTitle ? (
    <Container>
      <Text>{headerTitle}</Text>
      <IconContainer>
        {isLoading && (
          <IconContainer>
            <LoadingIndicator size={10} />
          </IconContainer>
        )}
        {isPlaying && !isPaused && <Icon src={`${APP_URL}/play.svg`} />}
        {isPaused && <Icon src={`${APP_URL}/pause.svg`} />}
        <StyledBatteryIndicator />
      </IconContainer>
    </Container>
  ) : null;
};

export default Header;
