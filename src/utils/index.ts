export const getUrlFromPath = (path: string) =>
  `http://tannerv.ddns.net:12345/SpotiFree/${encodeURI(path)}`;

export const formatTime = (seconds = 0, guide = seconds) => {
  let s: number | string = Math.floor(seconds % 60);
  let m: number | string = Math.floor((seconds / 60) % 60);
  let h: number | string = Math.floor(seconds / 3600);
  const gm = Math.floor((guide / 60) % 60);
  const gh = Math.floor(guide / 3600);

  if (isNaN(seconds) || seconds === Infinity) {
    h = m = s = "0";
  }

  h = h > 0 || gh > 0 ? `${h}:` : "";
  m = `${(h || gm >= 10) && m < 10 ? `0${m}` : m}:`;
  s = s < 10 ? `0${s}` : s;

  return h + m + s;
};
