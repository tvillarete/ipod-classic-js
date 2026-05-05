import { ScrollDirection } from "@/components/ClickWheel/sharedTypes";

/** The click-wheel control associated with the particular event */
type BaseEventContext =
  | "wheel"
  | "center"
  | "forward"
  | "backward"
  | "menu"
  | "playpause";

export type SupportedKeyCode =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Escape"
  | "Enter"
  | " "
  | "Spacebar";

/** The action that is taken on a click-wheel control */
type BaseEventAction = "click" | "longclick" | "scroll" | "longpress";

/** The custom events that are supported for the iPod */
export type IpodEvent = `${BaseEventContext}${BaseEventAction}` | `idle`;

/** Create a type-safe custom event for the iPod */
export const createIpodEvent = (eventName: IpodEvent) => new Event(eventName);

export type ScrollEventDetail = { velocity: number };

const backClickEvent = createIpodEvent("backwardclick");
const centerClickEvent = createIpodEvent("centerclick");
const centerLongClickEvent = createIpodEvent("centerlongclick");
const forwardClickEvent = createIpodEvent("forwardclick");
const idleEvent = createIpodEvent("idle");
const menuClickEvent = createIpodEvent("menuclick");
const menuLongPressEvent = createIpodEvent("menulongpress");
const playPauseClickEvent = createIpodEvent("playpauseclick");
const wheelClickEvent = createIpodEvent("wheelclick");

export const dispatchMenuClickEvent = () =>
  window.dispatchEvent(menuClickEvent);

export const dispatchCenterClickEvent = () =>
  window.dispatchEvent(centerClickEvent);

export const dispatchCenterLongClickEvent = () =>
  window.dispatchEvent(centerLongClickEvent);

export const dispatchForwardScrollEvent = (velocity = 0) =>
  window.dispatchEvent(
    new CustomEvent<ScrollEventDetail>("forwardscroll", {
      detail: { velocity },
    })
  );

export const dispatchBackwardScrollEvent = (velocity = 0) =>
  window.dispatchEvent(
    new CustomEvent<ScrollEventDetail>("backwardscroll", {
      detail: { velocity },
    })
  );

export const dispatchScrollEvent = (
  direction: ScrollDirection,
  velocity = 0
) =>
  direction === "clockwise"
    ? dispatchForwardScrollEvent(velocity)
    : dispatchBackwardScrollEvent(velocity);

export const dispatchWheelClickEvent = () =>
  window.dispatchEvent(wheelClickEvent);

export const dispatchMenuLongPressEvent = () =>
  window.dispatchEvent(menuLongPressEvent);

export const dispatchBackClickEvent = () =>
  window.dispatchEvent(backClickEvent);

export const dispatchForwardClickEvent = () =>
  window.dispatchEvent(forwardClickEvent);

export const dispatchPlayPauseClickEvent = () =>
  window.dispatchEvent(playPauseClickEvent);

export const dispatchIdleEvent = () => window.dispatchEvent(idleEvent);

export const dispatchKeyboardEvent = (key: string) => {
  switch (key) {
    case "ArrowUp":
    case "ArrowLeft":
      dispatchBackwardScrollEvent();
      break;
    case "ArrowDown":
    case "ArrowRight":
      dispatchForwardScrollEvent();
      break;
    case "Enter":
      dispatchCenterClickEvent();
      break;
    case " ":
    case "Spacebar":
      dispatchPlayPauseClickEvent();
      break;
    case "Escape":
      dispatchMenuClickEvent();
      break;
  }
};
