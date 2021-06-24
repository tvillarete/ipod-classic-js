import styled from "styled-components";
import { useBattery } from "hooks/battery";
import BatteryIcon from "components/icons/BatteryIcon";

const BatteryIndicatorIcon = styled(BatteryIcon)<{
  batteryLevel: number;
  isCharging: boolean;
}>`
  max-height: 12px;
  margin-left: 8px;

  #charge {
    display: block;
  }

  #charge rect {
    /* FIXME 8.7313px is a magic number set equal to the width of the charge rect
       in the SVG; a better approach would be welcomed! */
    width: ${({ batteryLevel }) => `calc(8.7313px * (${batteryLevel} / 100))`};
    fill: ${({ batteryLevel }) => (batteryLevel <= 20 ? "#B74124" : "#4E932C")};
  }

  #plug,
  #plugHack {
    display: ${({ batteryLevel, isCharging }) =>
      batteryLevel === 100 && isCharging ? "block" : "none"};
  }

  #bolt,
  #boltHack {
    display: ${({ batteryLevel, isCharging }) =>
      batteryLevel < 100 && isCharging ? "block" : "none"};
  }
`;

const BatteryIndicator = () => {
  const { batteryLevel, isCharging } = useBattery();

  const displayBatteryLevel = batteryLevel <= 10 ? 10 : batteryLevel;

  return (
    <BatteryIndicatorIcon
      batteryLevel={displayBatteryLevel}
      isCharging={isCharging}
    />
  );
};

export default BatteryIndicator;
