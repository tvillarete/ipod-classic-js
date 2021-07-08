import { WheelButton, WheelButtonProps } from '../Styled';

interface Props extends WheelButtonProps {
  color?: string;
}

const RewindIcon = (props: Props) => (
  <WheelButton
    width="33"
    height="16"
    viewBox="0 0 33 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M17 8L29 1.0718V14.9282L17 8Z" fill={props.color} />
    <path d="M4 8L16 1.0718V14.9282L4 8Z" fill={props.color} />
    <rect
      x="4"
      y="16"
      width="4"
      height="15"
      transform="rotate(-180 4 16)"
      fill={props.color}
    />
  </WheelButton>
);

export default RewindIcon;
