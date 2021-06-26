import { useBattery } from 'hooks/battery';
import styled, { css } from 'styled-components';

const batteryHealthyColor = '#A5E07F';
const batteryWarningColor = '#D17F6B';

const Container = styled.div`
  width: fit-content;
  height: 12px;
  display: flex;
  align-items: center;
`;

const ChargeLevelContainer = styled.div`
  height: 100%;
  width: 24px;
  position: relative;
  display: flex;
  border: 1px solid #626262ff;
  background: #54585b
    linear-gradient(180deg, transparent 25%, 65%, rgba(255, 255, 255, 0.5));
`;

const ChargeLevel = styled.div<{
  isCharging?: boolean;
  percent?: number;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;

  ${({ percent = 100, isCharging = false }) => css`
    width: ${percent}%;
    background: ${percent > 20 || isCharging
        ? batteryHealthyColor
        : batteryWarningColor}
      linear-gradient(
        180deg,
        transparent 10%,
        rgba(255, 255, 255, 0.5) 20%,
        35%,
        transparent 40%,
        rgba(0, 0, 0, 0.2) 55%,
        rgba(0, 0, 0, 0.3) 65%,
        rgba(0, 0, 0, 0.4) 80%
      );
  `};
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
  /* bump the icons above the charge level */
  z-index: 1;
`;

const StatusIcon = styled.img`
  opacity: 0.8;
`;

const BoltIcon = styled(StatusIcon)`
  height: 8px;
`;

const PlugIcon = styled(StatusIcon)`
  height: 6px;
`;

interface Props {
  className?: string;
}

const BatteryIndicator = ({ className }: Props) => {
  const { chargePercent, isCharging } = useBattery();

  const clampedChargePercent = chargePercent <= 15 ? 15 : chargePercent;

  const shouldShowPlugIcon = isCharging && chargePercent === 100;
  const shouldShowBoltIcon = isCharging && chargePercent < 100;

  return (
    <Container className={className}>
      <ChargeLevelContainer>
        <IconContainer>
          {shouldShowPlugIcon && <PlugIcon src="plug.svg" />}
          {shouldShowBoltIcon && <BoltIcon src="bolt.svg" />}
        </IconContainer>
        <ChargeLevel percent={clampedChargePercent} isCharging={isCharging} />
      </ChargeLevelContainer>

      {/* decorative cap for an authentic battery experience */}
      <BatteryCap />
    </Container>
  );
};

export default BatteryIndicator;
