import { WheelButton, WheelButtonProps } from '../Styled';

interface Props extends WheelButtonProps {
  color?: string;
}

const FastForwardIcon = (props: Props) => (
  <WheelButton
    width="33"
    height="16"
    viewBox="0 0 33 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M16 8L4 14.9282L4 1.0718L16 8Z" fill={props.color} />
    <path d="M29 8L17 14.9282V1.0718L29 8Z" fill={props.color} />
    <rect x="29" width="4" height="15" fill={props.color} />
  </WheelButton>
);

export default FastForwardIcon;
