import { createContext, useState } from "react";

import { SelectableListOption } from "components/SelectableList";
import views, { HomeView, ViewConfig } from "components/views";
import { SplitScreenPreview } from "components/previews";

type SharedOptionProps = {
  id: ViewConfig["id"];
  type: ViewConfig["type"];
  headerTitle?: string;
  /** Fire an event when the view closes. */
  onClose?: (..._args: any[]) => void;
  /** Any extra styles you want to pass to the view. */
  styles?: Record<string, any>;
};

export type ScreenViewOptionProps<
  TComponent extends React.ComponentType<any> = any
> = {
  /** These view types allow you to pass in a custom component to render. */
  type: "screen";
  /** The React component that will be rendered in the view. */
  component: TComponent;
  /** Props that will be passed to the component. */
  props?: Omit<React.ComponentProps<TComponent>, "id">;
  /** Fire an event when the view closes. */
  onClose?: (..._args: any[]) => void;
  title?: string;
};

type ActionSheetViewOptionProps = {
  type: "actionSheet";
  listOptions: SelectableListOption[];
};

type PopupViewOptionProps = {
  type: "popup";
  title: string;
  description?: string;
  listOptions: SelectableListOption[];
};

type KeyboardViewOptionProps = {
  type: "keyboard";
  initialValue?: string;
};

type CoverFlowViewOptionProps = {
  type: "coverFlow";
};

export type ViewOptions<TComponent extends React.ComponentType<any> = any> =
  SharedOptionProps &
    (
      | ScreenViewOptionProps<TComponent>
      | ActionSheetViewOptionProps
      | PopupViewOptionProps
      | KeyboardViewOptionProps
      | CoverFlowViewOptionProps
    );

interface ViewContextState {
  viewStack: ViewOptions[];
  headerTitle?: string;
  preview: SplitScreenPreview;
}

type ViewContextStateType = [
  ViewContextState,
  React.Dispatch<React.SetStateAction<ViewContextState>>
];

export const ViewContext = createContext<ViewContextStateType>([
  {
    viewStack: [],
    headerTitle: "iPod.js",
    preview: SplitScreenPreview.Music,
  },
  () => {},
]);

interface Props {
  children: React.ReactNode;
}

const ViewContextProvider = ({ children }: Props) => {
  const baseView: ViewOptions = {
    type: "screen",
    id: "home",
    component: HomeView,
  };

  const viewStack: ViewOptions[] = [baseView];
  const [viewContextState, setViewContextState] = useState<ViewContextState>({
    viewStack,
    headerTitle: views.home.title,
    preview: SplitScreenPreview.Music,
  });

  return (
    <ViewContext.Provider value={[viewContextState, setViewContextState]}>
      {children}
    </ViewContext.Provider>
  );
};

export default ViewContextProvider;
