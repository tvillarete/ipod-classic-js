import styled from 'styled-components';

const BackPanel = styled.div`
  display: flex;
  color: #b5c0c8;
  flex-direction: column;
  align-items: center;
`;

const IpodJs = styled.div`
  font-size: 48px;
  font-weight: 500;
  margin-top: 24px;
`;

const Storage = styled.div`
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 18px;
  border: 2px solid #d0d0d0;
  margin-top: 16px;
`;

const U2 = styled.div`
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

const SpecialEdition = styled.div`
  font-size: 14px;
`;

const Autographs = styled.div`
  display: flex;
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

const BackCase = () => (
  <BackPanel>
    <Autographs>
      <img height="160px" src={'u2_autographs.png'} />
    </Autographs>
    <AppleIcon height="65px" src={'apple.svg'} />
    <IpodJs>iPod</IpodJs>
    <SpecialEdition>Special Edition</SpecialEdition>
    <U2>U2</U2>
    <Storage>20GB</Storage>
    <Regulatory>
      Designed by Apple in California Assembled in China
      <br />
      Model No. A1059 EMC No. 1995 Rated 5-30Vdc 1.0A Max.
      <br />™ and © 2004 Apple Computer, Inc. All rights reserved.
    </Regulatory>
    <RegulatoryIcons height="24px" src={'regulatory_icons.svg'} />
  </BackPanel>
);

export default BackCase;
