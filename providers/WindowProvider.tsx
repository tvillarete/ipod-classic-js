import { createContext, useState } from 'react';

import { SelectableListOption } from 'components';
import { PREVIEW } from 'components/previews';
import ViewOptions, * as Views from 'components/views';

type SharedOptionProps = {
  id: string;
  type: Views.WINDOW_TYPE;
  /** Fire an event when the window closes. */
  onClose?: (...args: any[]) => void;
  headerTitle?: string;
  /** Any extra styles you want to pass to the window. */
  styles?: Record<string, any>;
};

type ListViewOptionProps<TComponent extends React.ComponentType<any> = any> = {
  /** These window types allow you to pass in a custom component to render. */
  type:
    | Views.WINDOW_TYPE.SPLIT
    | Views.WINDOW_TYPE.FULL
    | Views.WINDOW_TYPE.COVER_FLOW;
  /** The React component that will be rendered in the window. */
  component: TComponent;
  /** Props that will be passed to the component. */
  props?: Omit<React.ComponentProps<TComponent>, 'id'>;
  /** Fire an event when the window closes. */
  onClose?: (...args: any[]) => void;
};

type ActionSheetViewOptionProps = {
  type: Views.WINDOW_TYPE.ACTION_SHEET;
  listOptions: SelectableListOption[];
};

type PopupViewOptionProps = {
  type: Views.WINDOW_TYPE.POPUP;
  title: string;
  description?: string;
  listOptions: SelectableListOption[];
};

type KeyboardViewOptionProps = {
  type: Views.WINDOW_TYPE.KEYBOARD;
  initialValue?: string;
};

export type WindowOptions<TComponent extends React.ComponentType<any> = any> =
  SharedOptionProps &
    (
      | ListViewOptionProps<TComponent>
      | ActionSheetViewOptionProps
      | PopupViewOptionProps
      | KeyboardViewOptionProps
    );

interface WindowState {
  windowStack: WindowOptions[];
  headerTitle?: string;
  preview: PREVIEW;
}

type WindowContextType = [
  WindowState,
  React.Dispatch<React.SetStateAction<WindowState>>
];

export const WindowContext = createContext<WindowContextType>([
  {
    windowStack: [],
    headerTitle: 'iPod.js',
    preview: PREVIEW.MUSIC,
  },
  () => {},
]);

interface Props {
  children: React.ReactChild;
}

const WindowProvider = ({ children }: Props) => {
  const windowStack: WindowOptions[] = [
    {
      id: ViewOptions.home.id,
      type: Views.WINDOW_TYPE.SPLIT,
      component: Views.HomeView,
    },
  ];
  const [windowState, setWindowState] = useState<WindowState>({
    windowStack,
    headerTitle: ViewOptions.home.title,
    preview: PREVIEW.MUSIC,
  });

  return (
    <WindowContext.Provider value={[windowState, setWindowState]}>
      {children}
    </WindowContext.Provider>
  );
};

export default WindowProvider;
