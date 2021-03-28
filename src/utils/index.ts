export const getUrlFromPath = (path: string) =>
  `https://tannerv.ddns.net/SpotiFree/${encodeURI(path)}`;

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
