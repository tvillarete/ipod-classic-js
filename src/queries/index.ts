import { gql } from 'apollo-boost';

export type AlbumsQuery = {
  albums: [
    {
      artist: string;
      album: string;
      artwork: string;
    }
  ];
};

export const ALBUMS = gql`
  {
    albums {
      artist
      album
      artwork
    }
  }
`;
