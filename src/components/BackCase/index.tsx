import styled from 'styled-components';
import { useSettings } from '../../hooks/utils/useSettings';
import { DeviceTheme } from '../../utils/themes';

const BackPanel = styled.div`
  display: flex;
  color: #b5c0c8;
  flex-direction: column;
  align-items: center;
`;

const IpodJs = styled.div`
  font-size: 48px;
  font-weight: 500;
  margin-top: 16px;
`;

const Storage = styled.div`
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 18px;
  border: 2px solid #d0d0d0;
  margin-top: 16px;
`;

const U2 = styled.div<{ deviceTheme: DeviceTheme }>`
  opacity: ${({ deviceTheme }) => (deviceTheme !== 'u2' ? 0 : 1)};
  color: #eee;
  background: #b5c0c8;
  border-radius: 8px;
  padding: 4px;
  font-size: 28px;
  margin-top: 16px;
`;

const AppleIcon = styled.img`
  margin-top: 4px;
`;

const SpecialEdition = styled.div<{ deviceTheme: DeviceTheme }>`
  font-size: 14px;
  opacity: ${({ deviceTheme }) => (deviceTheme !== 'u2' ? 0 : 1)};
`;

const Autographs = styled.div<{ deviceTheme: DeviceTheme }>`
  display: ${({ deviceTheme }) => (deviceTheme !== 'u2' ? 'none' : 'flex')};
  align-items: center;
  margin-top: 10%;
`;

const Regulatory = styled.div`
  font-size: 8px;
  margin-top: 16px;
  color: #d0d0d0;
`;

const RegulatoryIcons = styled.img`
  margin-top: 16px;
`;

const Etch = styled.div<{ deviceTheme: DeviceTheme }>`
  display: ${({ deviceTheme }) => (deviceTheme === 'u2' ? 'none' : 'flex')};
  flex-direction: column;
  color: #b5c0c8;
  height: 160px;
  margin-top: 10%;
  align-items: center;
`;

const Line1 = styled.p`
  filter: grayscale(100%);
  margin: 0;
`;

const Line2 = styled(Line1)`
  margin-top: 4px;
`;

const BackCase = () => {
  const { deviceTheme } = useSettings();
  return (
    <BackPanel>
      <Autographs deviceTheme={deviceTheme}>
        <img alt="U2-autographs" height="160px" src={'u2_autographs.png'} />
      </Autographs>
      <Etch deviceTheme={deviceTheme}>
        <Line1>Manky's iPod</Line1>
        <Line2>Stay Hungry & Foolish ❤️</Line2>
      </Etch>
      <AppleIcon height="65px" src={'apple.svg'} />
      <IpodJs>iPod</IpodJs>
      <SpecialEdition deviceTheme={deviceTheme}>Special Edition</SpecialEdition>
      <U2 deviceTheme={deviceTheme}>U2</U2>
      <Storage>{deviceTheme === 'u2' ? '30' : '160'}GB</Storage>
      <Regulatory>
        Designed by Apple in California Assembled in China
        <br />
        Model No. {deviceTheme === 'u2' ? 'A1136' : 'A1238'} EMC No. 1995 Rated
        5-30Vdc 1.0A Max.
        <br />™ and © {deviceTheme === 'u2' ? '2006' : '2007'} Apple Computer,
        Inc. All rights reserved.
      </Regulatory>
      <RegulatoryIcons height="24px" src={'regulatory_icons.svg'} />
    </BackPanel>
  );
};

export default BackCase;
