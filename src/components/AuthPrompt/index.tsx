import { Unit } from 'components';
import styled from 'styled-components';

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  background: white;
`;

const Text = styled.h3`
  margin: ${Unit.MD} 0 0;
  font-weight: bold;
  font-size: 16px;
  max-width: 150px;
`;

const strings = {
  defaultMessage: 'Sign into Apple Music to access this content',
};

interface Props {
  message?: string;
}

const AuthPrompt = ({ message }: Props) => {
  return (
    <RootContainer>
      <img alt="app_icon" src="app_icon.png" />
      <Text>{message ?? strings.defaultMessage}</Text>
    </RootContainer>
  );
};

export default AuthPrompt;
