import { SelectableListOption } from 'components';

/** Accepts a url with '{w}' and '{h}' and replaces them with the specified size */
export const getArtwork = (size: number | string, url?: string) => {
  if (!url) {
    return undefined;
  }

  return url.replace('{w}', `${size}`).replace('{h}', `${size}`);
};

export const formatTime = (seconds = 0, guide = seconds) => {
  let s: number | string = Math.floor(seconds % 60);
  let m: number | string = Math.floor((seconds / 60) % 60);
  let h: number | string = Math.floor(seconds / 3600);
  const gm = Math.floor((guide / 60) % 60);
  const gh = Math.floor(guide / 3600);

  if (isNaN(seconds) || seconds === Infinity) {
    h = m = s = '-';
  }

  h = h > 0 || gh > 0 ? `${h}:` : '';
  m = `${(h || gm >= 10) && m < 10 ? `0${m}` : m}:`;
  s = s < 10 ? `0${s}` : s;

  return h + m + s;
};

export const setDocumentSongTitle = (song?: AppleMusicApi.Song) => {
  document.title = song
    ? `${song.attributes?.name ?? 'Music'} – iPod.js`
    : 'iPod.js';
};

/** Returns a list of playback options to display in a popup for an album, song, or playlist. */
export const getMediaOptions = (
  type: 'album' | 'song' | 'playlist',
  id: string
): SelectableListOption[] => {
  const music = window.MusicKit.getInstance();

  return [
    {
      type: 'Action',
      label: 'Play Next',
      onSelect: () =>
        music.playNext({
          [type]: id,
        }),
    },
    {
      type: 'Action',
      label: 'Play Later',
      onSelect: () =>
        music.playLater({
          [type]: id,
        }),
    },
  ];
};

export const isDev = () => window.location.origin.includes('localhost:3000');
