/** The click-wheel control associated with the particular event */
type BaseEventContext =
  | 'wheel'
  | 'center'
  | 'forward'
  | 'backward'
  | 'menu'
  | 'playpause';

/** The action that is taken on a click-wheel control */
type BaseEventAction = 'click' | 'longclick' | 'scroll' | 'longpress';

/** The custom events that are supported for the iPod */
export type IpodEvent = `${BaseEventContext}${BaseEventAction}` | `idle`;

/** Create a type-safe custom event for the iPod */
export const createIpodEvent = (eventName: IpodEvent) => new Event(eventName);
