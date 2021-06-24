interface Props {
  className?: string;
}

/**
 * Bolt and plug designs taken from Font Awesome v5.15 under the CC BY 4.0 license.
 * No changes were made to the original designs.
 * 
 * https://fontawesome.com/license/free
 */
const BatteryIcon = ({ className }: Props) => {
  return (
    <svg
      className={className}
      width="9.7896mm"
      height="4.7625mm"
      version="1.1"
      viewBox="0 0 9.7896 4.7625"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="linearGradient19855"
          x1="17.698"
          x2="17.614"
          y1=".081609"
          y2="17.865"
          gradientTransform="matrix(.98068 0 0 .96317 .32838 .33145)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity="0" offset="0" />
          <stop stopColor="#fff" offset=".12706" />
          <stop stopColor="#fff" stopOpacity=".82329" offset=".22931" />
          <stop stopColor="#fff" stopOpacity=".29317" offset=".46222" />
          <stop stopOpacity=".15663" offset=".60637" />
          <stop stopOpacity=".31325" offset=".75017" />
          <stop stopOpacity=".28514" offset=".86088" />
          <stop stopColor="#fff" stopOpacity="0" offset="1" />
        </linearGradient>
      </defs>
      <g id="charge" display="none">
        <rect
          x=".13229"
          y=".13229"
          width="8.7312"
          height="4.4979"
          fill="#00b040"
          strokeWidth="0"
        />
      </g>
      <g id="plug" display="none">
        <path
          d="m6.4452 3.2672a0.22149 0.22149 0 0 0 0-0.44297h-0.66446v0.44297zm-0.88594 0.33223v-2.4363a0.11074 0.11074 0 0 0-0.11074-0.11075h-0.22148a0.11074 0.11074 0 0 0-0.11074 0.11075v0.11074h-0.22149a1.1079 1.1079 0 0 0-1.0853 0.88594h-0.6866v0.44298h0.6866a1.1079 1.1079 0 0 0 1.0853 0.88595h0.22149v0.11073a0.11074 0.11074 0 0 0 0.11074 0.11075h0.22148a0.11074 0.11074 0 0 0 0.11074-0.11075zm0.88594-1.6611a0.22149 0.22149 0 0 0 0-0.44298h-0.66446v0.44298z"
          display="inline"
          fill="currentColor"
          strokeWidth=".0069214"
        />
      </g>
      <g id="bolt" display="none">
        <path
          d="m5.6707 1.7935h-0.65834l0.24303-0.79466c0.022825-0.093052-0.042773-0.18488-0.13235-0.18488h-0.82149c-0.068458 0-0.12665 0.054427-0.13578 0.12734l-0.18256 1.4693c-0.010859 0.088119 0.053068 0.16652 0.13578 0.16652h0.67716l-0.26299 1.1908c-0.020546 0.093061 0.045659 0.18061 0.13292 0.18061 0.047947 0 0.093562-0.0269 0.11866-0.073463l1.0041-1.8611c0.053068-0.097351-0.01253-0.2204-0.11809-0.2204z"
          display="inline"
          fill="currentColor"
          strokeWidth=".0059098"
        />
      </g>
      <g transform="matrix(.26458 0 0 .26458 2e-6 4e-6)">
        <rect
          transform="translate(-3.7008e-6)"
          x=".5"
          y=".5"
          width="33"
          height="17"
          fill="url(#linearGradient19855)"
          stroke="#9bac8c"
          strokeWidth="0"
        />
      </g>
      <g id="plugHack" display="none" opacity=".337">
        <path
          d="m6.4452 3.2672a0.22149 0.22149 0 0 0 0-0.44297h-0.66446v0.44297zm-0.88594 0.33223v-2.4363a0.11074 0.11074 0 0 0-0.11074-0.11074h-0.22148a0.11074 0.11074 0 0 0-0.11074 0.11074v0.11074h-0.22149a1.1079 1.1079 0 0 0-1.0853 0.88594h-0.6866v0.44298h0.6866a1.1079 1.1079 0 0 0 1.0853 0.88595h0.22149v0.11073a0.11074 0.11074 0 0 0 0.11074 0.11075h0.22148a0.11074 0.11074 0 0 0 0.11074-0.11075zm0.88594-1.6611a0.22149 0.22149 0 0 0 0-0.44298h-0.66446v0.44298z"
          display="inline"
          fill="currentColor"
          strokeWidth=".0069214"
        />
      </g>
      <g id="boltHack" display="none" opacity=".33651">
        <path
          d="m5.6707 1.7935h-0.65834l0.24303-0.79466c0.022825-0.093052-0.042773-0.18488-0.13235-0.18488h-0.82149c-0.068458 0-0.12665 0.054427-0.13578 0.12734l-0.18256 1.4693c-0.010859 0.088119 0.053068 0.16652 0.13578 0.16652h0.67716l-0.26299 1.1908c-0.020546 0.093061 0.045659 0.18061 0.13292 0.18061 0.047947 0 0.093562-0.0269 0.11866-0.073463l1.0041-1.8611c0.053068-0.097351-0.01253-0.2204-0.11809-0.2204z"
          display="inline"
          fill="currentColor"
          strokeWidth=".0059098"
        />
      </g>
      <g>
        <g transform="scale(.26458)" fill="none" stroke="#626262">
          <rect x="33.5" y="5.5" width="3" height="6" rx=".5" fill="#c4c4c4" />
          <rect x=".5" y=".5" width="33" height="17" />
        </g>
      </g>
    </svg>
  );
};

export default BatteryIcon;
