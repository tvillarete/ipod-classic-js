import { Unit } from 'components';
import { SadMacIcon } from 'components/icons';
import styled from 'styled-components';

const RootContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
`;

const Text = styled.p`
  margin-top: ${Unit.MD};
  font-size: 14px;
  max-width: 180px;
  color: rgb(100, 100, 100);
`;

const strings = {
  defaultMessage: 'Something went wrong',
};

interface Props {
  message?: string;
}

const ErrorScreen = ({ message }: Props) => {
  return (
    <RootContainer>
      <div>
        <SadMacIcon />
        <Text>{message ?? strings.defaultMessage}</Text>
      </div>
    </RootContainer>
  );
};

export default ErrorScreen;
