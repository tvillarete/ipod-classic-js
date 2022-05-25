import React, { FC } from 'react';
import StyledBackdrop from './StyledBackdrop';
import StyledModal from './StyledModal';
import Button from '../Button';
import Box from '../Box';
import Text from '../Text';

export interface NotificationProps {
  win: boolean;
  onClose: () => void;
}

const Notification: FC<NotificationProps> = ({ win, onClose }) => (
  <StyledModal>
    <StyledBackdrop />
    <Box paddingBlock="s5" background="transparent">
      <Text fontSize={22} color="primary">
        {win ? 'You win! Continue?' : 'Oops...Game Over!'}
      </Text>
    </Box>
    <Button onClick={onClose}>{win ? 'Continue' : 'Retry'}</Button>
  </StyledModal>
);

export default Notification;
