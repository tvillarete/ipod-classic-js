import React, { useCallback, useEffect, useState } from 'react';

import {
  LoadingIndicator,
  SelectableList,
  SelectableListOption,
} from 'components';
import { useEventListener, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import styled from 'styled-components';

import ViewOptions from '../';

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
  albumId: AppleMusicApi.Album['id'];
  setPlayingAlbum: (val: boolean) => void;
}

const BacksideContent = ({ albumId, setPlayingAlbum }: Props) => {
  const [album, setAlbum] = useState<AppleMusicApi.Album>();
  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.coverFlow.id, options);

  const handleMount = useCallback(async () => {
    const fetchedAlbum = await music.api.library.album(albumId);
    setAlbum(fetchedAlbum);
    const songs = fetchedAlbum.relationships?.tracks.data ?? [];

    setOptions(
      songs.map((song, index) => ({
        type: 'Song',
        label: song.attributes?.name ?? 'Unknown song',
        queueOptions: {
          album: fetchedAlbum.id,
          startPosition: index,
        },
      }))
    );

    setLoading(false);
  }, [albumId, music.api.library]);

  useEffect(() => {
    if (!album) {
      handleMount();
    }
  }, [album, handleMount]);

  useEventListener('centerclick', () => setPlayingAlbum(true));

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <InfoContainer>
            <Text>{album?.attributes?.name}</Text>
            <Subtext>{album?.attributes?.artistName}</Subtext>
          </InfoContainer>
          <ListContainer>
            <SelectableList activeIndex={index} options={options} />
          </ListContainer>
        </>
      )}
    </Container>
  );
};

export default BacksideContent;
