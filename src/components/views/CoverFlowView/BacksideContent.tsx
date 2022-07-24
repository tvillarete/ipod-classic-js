import { useMemo } from 'react';

import {
  LoadingScreen,
  SelectableList,
  SelectableListOption,
} from 'components';
import { useFetchAlbum, useEventListener, useScrollHandler } from 'hooks';
import styled from 'styled-components';

import ViewOptions from '../';
import { IpodEvent } from 'utils/events';

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: -28%;
  bottom: -50%;
  left: -50%;
  right: -50%;
  border: 1px solid lightgray;
  background: white;
  transform: rotateY(180deg);
`;

const InfoContainer = styled.div`
  padding: 4px 8px;
  background: linear-gradient(180deg, #6585ad 0%, #789ab3 100%);
  border-bottom: 1px solid #6d87a3;
`;

const Text = styled.h3`
  font-size: 16px;
  margin: 0;
  color: white;
`;

const Subtext = styled(Text)`
  font-size: 14px;
`;

const ListContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
`;

interface Props {
  albumId: IpodApi.Album['id'];
  setPlayingAlbum: (val: boolean) => void;
}

const BacksideContent = ({ albumId, setPlayingAlbum }: Props) => {
  const { data: album, isLoading } = useFetchAlbum({
    id: albumId,
    inLibrary: true,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      album?.songs.map((song, index) => ({
        type: 'Song',
        label: song.name,
        queueOptions: {
          album,
          startPosition: index,
        },
      })) ?? [],
    [album]
  );
  const [scrollIndex] = useScrollHandler(ViewOptions.coverFlow.id, options);

  useEventListener<IpodEvent>('centerclick', () => setPlayingAlbum(true));

  return (
    <Container>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <InfoContainer>
            <Text>{album?.name}</Text>
            <Subtext>{album?.artistName}</Subtext>
          </InfoContainer>
          <ListContainer>
            <SelectableList activeIndex={scrollIndex} options={options} />
          </ListContainer>
        </>
      )}
    </Container>
  );
};

export default BacksideContent;
