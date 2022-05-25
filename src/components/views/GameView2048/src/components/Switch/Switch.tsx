import React, { FC } from 'react';
import StyledCheckbox from './StyledCheckbox';
import StyledKnob from './StyledKnob';
import StyledSwitch from './StyledSwitch';
import Box from '../Box';
import Text from '../Text';

export interface SwitchProps {
  checked: boolean;
  activeValue: string;
  inactiveValue: string;
  title?: string;
  onChange: (newValue: string) => void;
}

const Switch: FC<SwitchProps> = ({
  checked,
  activeValue,
  inactiveValue,
  title,
  onChange,
}) => (
  <Box>
    {title && (
      <Box marginInlineEnd="s3">
        <Text color="primary" textTransform="capitalize" fontSize={16}>
          {title}
        </Text>
      </Box>
    )}
    <StyledSwitch
      onClick={(e) => {
        e.preventDefault();
        onChange(checked ? inactiveValue : activeValue);
      }}
    >
      <StyledCheckbox
        defaultChecked={checked}
        value={checked ? activeValue : inactiveValue}
      />
      <StyledKnob
        active={checked}
        knobColor="background"
        activeColor="white"
        inactiveColor="black"
      />
    </StyledSwitch>
  </Box>
);

export default Switch;
