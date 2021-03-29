import LoadingIndicator from 'components/LoadingIndicator';
import { useForceUpdate, useMKEventListener } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import { useWindowService } from 'services/window';
import styled from 'styled-components';

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
`;

const IconContainer = styled.div`
  display: flex;
`;

const Icon = styled.img`
  max-height: 12px;
  margin-left: 8px;
`;

const Header = () => {
  const { headerTitle } = useWindowService();
  const { music } = useMusicKit();
  const forceUpdate = useForceUpdate();
  const playbackState = music.player?.playbackState;

  /** Re-render the component with the new playback state when this event triggers. */
  useMKEventListener('playbackStateDidChange', forceUpdate);

  return headerTitle ? (
    <Container>
      <Text>{headerTitle}</Text>
      <IconContainer>
        {playbackState === MusicKit.PlaybackStates.waiting && (
          <IconContainer>
            <LoadingIndicator size={10} />
          </IconContainer>
        )}
        {playbackState === MusicKit.PlaybackStates.playing && (
          <Icon src="play.svg" />
        )}
        {playbackState === MusicKit.PlaybackStates.paused && (
          <Icon src="pause.svg" />
        )}
        <Icon src="battery.svg" />
      </IconContainer>
    </Container>
  ) : null;
};

export default Header;
