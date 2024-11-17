interface Props {
  color?: string;
}

const PlayPauseIcon = (props: Props) => (
  <svg
    width="27"
    height="15"
    viewBox="0 0 39 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M18 9L4.5 16.7942L4.5 1.20577L18 9Z" fill={props.color} />
    <rect x="26" y="1" width="4" height="16" fill={props.color} />
    <rect x="35" y="1" width="4" height="16" fill={props.color} />
  </svg>
);

export default PlayPauseIcon;
