import { gql } from 'apollo-boost';
import { Song } from 'services/audio';

export type Album = {
  artist: string;
  album: string;
  artwork: string;
};

export type AlbumsQuery = {
  albums: Album[];
};

export type AlbumQuery = {
  album: Song[];
};

export type ArtistQuery = {
  artist: [
    {
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

export const ALBUM = gql`
  query Album($name: String!) {
    album(name: $name) {
      id
      name
      artist
      album
      artwork
      track
      url
    }
  }
`;

export const ARTIST = gql`
  query Artist($name: String!) {
    artist(name: $name) {
      album
      artwork
    }
  }
`;
