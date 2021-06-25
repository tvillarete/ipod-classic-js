import { useBattery } from 'hooks/battery';
import styled from 'styled-components';

const Container = styled.div`
  width: fit-content;
  height: 12px;
  display: flex;
  align-items: center;
`;

const ChargeLevelContainer = styled.div`
  height: 100%;
  width: 20px;
  position: relative;
  display: flex;
`;

const ChargeLevel = styled.progress<{
  isCharging?: boolean;
}>`
  border-radius: 0;
  border: 1px solid #626262ff;
  height: 100%;

  &::-webkit-progress-bar {
    background-color: transparent;
  }

  &::-webkit-progress-value {
    background-color: ${(props) => ((props.value ?? 100) <= 20) && !props.isCharging ? "#B74124" : "#4E932C"};
  }
`;

const ChargeLevelGloss = styled.div`
  padding: 1px;
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 10%,
    rgba(255,255,255, 1) 20%,
    rgba(255, 255, 255, .82) 30%,
    rgba(255, 255, 255, .29) 45%,
    rgba(0, 0, 0, .16) 60%,
    rgba(0, 0, 0, .31) 80%,
    rgba(0, 0, 0, .29) 90%,
    transparent 100%
  );
  background-clip: content-box;
  opacity: .7;
`;

const BatteryCap = styled.div`
  width: 3px;
  height: 8px;

  border: 1px solid #626262;
  border-left: 0;
  border-radius: 0 1px 1px 0;

  background: #c4c4c4;
`;

const IconContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusIcon = styled.img`
  opacity: .8;
`;

const BoltIcon = styled(StatusIcon)`
  height: 8px;
`;

const PlugIcon = styled(StatusIcon)`
  height: 6px;
`;

const BatteryIndicator = () => {
  const { chargePercent, isCharging } = useBattery();

  const clampedChargePercent = chargePercent <= 15 ? 15 : chargePercent;

  return (
    <Container>
      <ChargeLevelContainer>
        <ChargeLevelGloss />
        <IconContainer>
          { isCharging
              ? chargePercent === 100
                ? <PlugIcon src="plug.svg" />
                : <BoltIcon src="bolt.svg" />
              : null }
        </IconContainer>
        <ChargeLevel max={100} value={clampedChargePercent} isCharging={isCharging} />
      </ChargeLevelContainer>

      {/* decorative cap for an authentic battery experience */}
      <BatteryCap />
    </Container>
  );
};

export default BatteryIndicator;