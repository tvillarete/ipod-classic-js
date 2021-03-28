import { useCallback, useEffect, useState } from 'react';

import { LoadingIndicator } from 'components';
import { useMusicKit } from 'hooks/useMusicKit';
import styled from 'styled-components';

import CoverFlow from './CoverFlow';

const Container = styled.div`
  flex: 1;
`;

const CoverFlowView = () => {
  const [albums, setAlbums] = useState<AppleMusicApi.Album[]>([]);

  const { music } = useMusicKit();
  const [loading, setLoading] = useState(true);

  const handleMount = useCallback(async () => {
    const albums = await music.api.library.albums(null);

    setAlbums(albums);

    setLoading(false);
  }, [music]);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <Container>
      {loading ? (
        <LoadingIndicator backgroundColor="white" />
      ) : (
        <CoverFlow albums={albums} />
      )}
    </Container>
  );
};

export default CoverFlowView;
