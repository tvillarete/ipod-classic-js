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

const Title = styled.h3`
  margin: ${Unit.XS} 0 ${Unit.XXS};
  font-weight: bold;
  font-size: 20px;
`;

const Text = styled.p`
  font-size: 14px;
  margin: 0;
  max-width: 120px;
  color: rgb(100, 100, 100);
`;

const strings = {
  title: ' Music',
  defaultMessage: 'Sign into view this content',
};

interface Props {
  message?: string;
}

const AuthPrompt = ({ message }: Props) => {
  return (
    <RootContainer>
      <img alt="app_icon" src="app_icon.png" height={60} width={60} />
      <Title>{strings.title}</Title>
      <Text>{message ?? strings.defaultMessage}</Text>
    </RootContainer>
  );
};

export default AuthPrompt;
