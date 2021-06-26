import { useBattery } from 'hooks/battery';
import styled from 'styled-components';

const Container = styled.div`
  width: fit-content;
  height: 12px;
  display: flex;
  align-items: center;

  --battery-healthy: #A5E07F;
  --battery-warning: #D17F6B;
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
    background: #54585B linear-gradient(
      180deg,
      transparent 25%,
      65%,
      rgba(255, 255, 255, .5)
    );
  }

  &::-webkit-progress-value {
    background: ${(props) => ((props.value ?? 100) <= 20) && !props.isCharging ? "var(--battery-warning)" : "var(--battery-healthy)"} linear-gradient(
      180deg,
      transparent 10%,
      rgba(255, 255, 255, .5) 20%,
      35%,
      transparent 40%,
      rgba(0, 0, 0, .2) 55%,
      rgba(0, 0, 0, .3) 65%,
      rgba(0, 0, 0, .4) 80%
    );
  }
`;

const BatteryCap = styled.div`
  width: 2px;
  height: 4px;

  border: 1px solid #626262;
  border-left: 0;
  border-radius: 0 1.5px 1.5px 0;

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