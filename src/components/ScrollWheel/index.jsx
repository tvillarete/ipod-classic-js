import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// NOTE: This is a legacy file that I pulled from an
//       older version of this same project.

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin: auto 0;
`;

const CanvasContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const Canvas = styled.canvas`
  border-radius: 50%;
`;

const CenterButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: ${props => props.size / 2.5}px;
  height: ${props => props.size / 2.5}px;
  border-radius: 50%;
  background: rgb(225, 225, 225);
  :active {
    filter: brightness(0.9);
  }
`;

const WheelButton = styled.img`
  position: absolute;
  margin: ${props => props.margin};
  top: ${props => props.top};
  bottom: ${props => props.bottom};
  left: ${props => props.left};
  right: ${props => props.right};
  user-select: none;
  pointer-events: none;
  max-height: 13px;
`;

class Knob extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    onWheelClick: PropTypes.func,
    onChangeEnd: PropTypes.func,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    log: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    lineCap: PropTypes.oneOf(["butt", "round"]),
    bgColor: PropTypes.string,
    fgColor: PropTypes.string,
    inputColor: PropTypes.string,
    font: PropTypes.string,
    fontWeight: PropTypes.string,
    clockwise: PropTypes.bool,
    cursor: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    stopper: PropTypes.bool,
    disableTextInput: PropTypes.bool,
    displayInput: PropTypes.bool,
    displayCustom: PropTypes.func,
    angleArc: PropTypes.number,
    angleOffset: PropTypes.number,
    className: PropTypes.string,
    canvasClassName: PropTypes.string
  };

  static defaultProps = {
    onChangeEnd: () => {},
    onWheelClick: () => {},
    onClick: () => {},
    min: 0,
    max: 100,
    step: 1,
    log: false,
    width: 200,
    height: 200,
    thickness: 0.35,
    lineCap: "butt",
    bgColor: "#EEE",
    fgColor: "#EA2",
    inputColor: "",
    font: "Arial",
    fontWeight: "bold",
    clockwise: true,
    cursor: false,
    stopper: true,
    disableTextInput: false,
    displayInput: true,
    angleArc: 360,
    angleOffset: 0,
    className: null,
    canvasClassName: null
  };

  constructor(props) {
    super(props);
    this.w = this.props.width || 200;
    this.h = this.props.height || this.w;
    this.cursorExt = this.props.cursor === true ? 0.3 : this.props.cursor / 100;
    this.angleArc = (this.props.angleArc * Math.PI) / 180;
    this.angleOffset = (this.props.angleOffset * Math.PI) / 180;
    this.startAngle = 1.5 * Math.PI + this.angleOffset;
    this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;
    this.digits =
      Math.max(
        String(Math.abs(this.props.min)).length,
        String(Math.abs(this.props.max)).length,
        2
      ) + 2;
  }

  componentDidMount() {
    this.drawCanvas();
    this.canvasRef.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.width && this.w !== nextProps.width) {
      this.w = nextProps.width;
    }
    if (nextProps.height && this.h !== nextProps.height) {
      this.h = nextProps.height;
    }
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  componentWillUnmount() {
    this.canvasRef.removeEventListener("touchstart", this.handleTouchStart);
  }

  getArcToValue = v => {
    let startAngle;
    let endAngle;
    const angle = !this.props.log
      ? ((v - this.props.min) * this.angleArc) /
        (this.props.max - this.props.min)
      : Math.log(Math.pow(v / this.props.min, this.angleArc)) /
        Math.log(this.props.max / this.props.min);
    if (!this.props.clockwise) {
      startAngle = this.endAngle + 0.00001;
      endAngle = startAngle - angle - 0.00001;
    } else {
      startAngle = this.startAngle - 0.00001;
      endAngle = startAngle + angle + 0.00001;
    }
    if (this.props.cursor) {
      startAngle = endAngle - this.cursorExt;
      endAngle += this.cursorExt;
    }
    return {
      startAngle,
      endAngle,
      acw: !this.props.clockwise && !this.props.cursor
    };
  };

  // Calculate ratio to scale canvas to avoid blurriness on HiDPI devices
  getCanvasScale = ctx => {
    const devicePixelRatio =
      window.devicePixelRatio ||
      window.screen.deviceXDPI / window.screen.logicalXDPI || // IE10
      1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  };

  coerceToStep = v => {
    let val = !this.props.log
      ? ~~((v < 0 ? -0.5 : 0.5) + v / this.props.step) * this.props.step
      : Math.pow(
          this.props.step,
          ~~(
            (Math.abs(v) < 1 ? -0.5 : 0.5) +
            Math.log(v) / Math.log(this.props.step)
          )
        );
    val = Math.max(Math.min(val, this.props.max), this.props.min);
    if (isNaN(val)) {
      val = 0;
    }
    return Math.round(val * 1000) / 1000;
  };

  eventToValue = e => {
    const bounds = this.canvasRef.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    let a = Math.atan2(x - this.w / 2, this.w / 2 - y) - this.angleOffset;
    if (!this.props.clockwise) {
      a = this.angleArc - a - 2 * Math.PI;
    }
    if (this.angleArc !== Math.PI * 2 && a < 0 && a > -0.5) {
      a = 0;
    } else if (a < 0) {
      a += Math.PI * 2;
    }
    const val = !this.props.log
      ? (a * (this.props.max - this.props.min)) / this.angleArc + this.props.min
      : Math.pow(this.props.max / this.props.min, a / this.angleArc) *
        this.props.min;
    return this.coerceToStep(val);
  };

  handleMouseDown = e => {
    this.props.onChange(this.eventToValue(e));
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUpNoMove);
  };

  handleMouseMove = e => {
    e.preventDefault();
    const val = this.eventToValue(e);

    if (val !== this.props.value) {
      this.props.onChange(this.eventToValue(e));
    }

    document.removeEventListener("mouseup", this.handleMouseUpNoMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseUp = e => {
    this.props.onChangeEnd(this.eventToValue(e));
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  findClickQuadrant = (rectSize, x, y) => {
    if (y < rectSize / 4) {
      return 1;
    } else if (y > rectSize * 0.75) {
      return 2;
    } else if (x < rectSize / 4) {
      return 3;
    } else if (x > rectSize * 0.75) {
      return 4;
    }
    return -1;
  };

  handleMouseUpNoMove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rectWidth = rect.width;
    const quadrant = this.findClickQuadrant(rectWidth, x, y);
    if (quadrant > 0 && quadrant <= 4) {
      this.props.onWheelClick(quadrant);
    }

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("mouseup", this.handleMouseUpNoMove);
  };

  handleTouchStart = e => {
    e.preventDefault();
    this.touchIndex = e.targetTouches.length - 1;
    this.props.onChange(this.eventToValue(e.targetTouches[this.touchIndex]));
    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false
    });
    document.addEventListener("touchend", this.handleTouchEnd);
    document.addEventListener("touchcancel", this.handleTouchEnd);
  };

  handleTouchMove = e => {
    e.preventDefault();
    this.props.onChange(this.eventToValue(e.targetTouches[this.touchIndex]));
  };

  handleTouchEnd = e => {
    this.props.onChangeEnd(this.eventToValue(e));
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchEnd);
  };

  handleEsc = e => {
    if (e.keyCode === 27) {
      e.preventDefault();
      this.handleMouseUp();
    }
  };

  handleTextInput = e => {
    const val =
      Math.max(Math.min(+e.target.value, this.props.max), this.props.min) ||
      this.props.min;
    this.props.onChange(val);
  };

  handleWheel = e => {
    e.preventDefault();
    if (e.deltaX > 0 || e.deltaY > 0) {
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value + this.props.step
            : this.props.value * this.props.step
        )
      );
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value - this.props.step
            : this.props.value / this.props.step
        )
      );
    }
  };

  handleArrowKey = e => {
    if (e.keyCode === 37 || e.keyCode === 40) {
      e.preventDefault();
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value - this.props.step
            : this.props.value / this.props.step
        )
      );
    } else if (e.keyCode === 38 || e.keyCode === 39) {
      e.preventDefault();
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value + this.props.step
            : this.props.value * this.props.step
        )
      );
    }
  };

  inputStyle = () => ({
    width: `${(this.w / 2 + 4) >> 0}px`,
    height: `${(this.w / 3) >> 0}px`,
    position: "absolute",
    verticalAlign: "middle",
    marginTop: `${(this.w / 3) >> 0}px`,
    marginLeft: `-${((this.w * 3) / 4 + 2) >> 0}px`,
    border: 0,
    outline: "none",
    background: "none",
    font: `${this.props.fontWeight} ${(this.w / this.digits) >> 0}px ${
      this.props.font
    }`,
    textAlign: "center",
    color: this.props.inputColor || this.props.fgColor,
    padding: "0px",
    WebkitAppearance: "none",
    cursor: "pointer"
  });

  drawCanvas() {
    const ctx = this.canvasRef.getContext("2d");
    const scale = this.getCanvasScale(ctx);
    this.canvasRef.width = this.w * scale; // clears the canvas
    this.canvasRef.height = this.h * scale;
    ctx.scale(scale, scale);
    this.xy = this.w / 2; // coordinates of canvas center
    this.lineWidth = this.xy * this.props.thickness;
    this.radius = this.xy - this.lineWidth / 2;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = this.props.lineCap;
    // background arc
    ctx.beginPath();
    ctx.strokeStyle = this.props.bgColor;
    ctx.arc(
      this.xy,
      this.xy,
      this.radius,
      this.endAngle - 0.00001,
      this.startAngle + 0.00001,
      true
    );
    ctx.stroke();
    // foreground arc
    const a = this.getArcToValue(this.props.value);
    ctx.beginPath();
    ctx.strokeStyle = this.props.fgColor;
    ctx.arc(this.xy, this.xy, this.radius, a.startAngle, a.endAngle, a.acw);
    ctx.stroke();
  }

  render() {
    const { canvasClassName, onClick } = this.props;

    return (
      <Container>
        <CanvasContainer width={this.w} height={this.h}>
          <Canvas
            ref={ref => {
              this.canvasRef = ref;
            }}
            className={canvasClassName}
            style={{ width: "100%", height: "100%" }}
            onMouseDown={this.handleMouseDown}
          />
          <CenterButton onClick={onClick} size={this.w} />
          <WheelButton top="8%" margin="0 auto" src="menu.svg" />
          <WheelButton right="8%" margin="auto 0" src="fast_forward.svg" />
          <WheelButton left="8%" margin="auto 0" src="rewind.svg" />
          <WheelButton bottom="8%" margin="0 auto" src="play_pause.svg" />
        </CanvasContainer>
      </Container>
    );
  }
}

export default Knob;
