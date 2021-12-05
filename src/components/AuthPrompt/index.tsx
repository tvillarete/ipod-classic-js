import { useState } from 'react';

import { useInterval, useMusicKit } from 'hooks';
import styled, { css } from 'styled-components';
import { Unit } from 'utils/constants';

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
  background: white;
`;

const StyledImg = styled.img<{ isHidden: boolean }>`
  height: 60px;
  width: 60px;
  transition: all 0.5s ease-in-out;

  ${({ isHidden }) =>
    isHidden &&
    css`
      opacity: 0;
    `};

  :last-of-type {
    margin-top: -60px;
  }
`;

const Title = styled.h3`
  margin: ${Unit.XS} 0 ${Unit.XXS};
  font-weight: bold;
  font-size: 18px;
`;

const Text = styled.p`
  font-size: 14px;
  margin: 0;
  max-width: 120px;
  color: rgb(100, 100, 100);
`;

const strings = {
  title: {
    apple: 'Apple Music',
    spotify: 'Spotify',
  },
  defaultMessage: 'Sign into view this content',
};

interface Props {
  message?: string;
}

const AuthPrompt = ({ message }: Props) => {
  const { isConfigured: isMkConfigured } = useMusicKit();
  const [icon, setIcon] = useState<'apple' | 'spotify'>(
    isMkConfigured ? 'apple' : 'spotify'
  );

  useInterval(
    () =>
      setIcon((prevState) => {
        if (prevState === 'apple' || !isMkConfigured) {
          return 'spotify';
        }

        return 'apple';
      }),
    4000
  );

  return (
    <RootContainer>
      <StyledImg
        isHidden={icon === 'spotify'}
        alt="app_icon"
        src="apple_music_icon.svg"
      />
      {isMkConfigured && (
        <StyledImg
          isHidden={icon === 'apple'}
          alt="app_icon"
          src="spotify_icon.svg"
        />
      )}
      <Title>{strings.title[icon]}</Title>
      <Text>{message ?? strings.defaultMessage}</Text>
    </RootContainer>
  );
};

export default AuthPrompt;
