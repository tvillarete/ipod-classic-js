import { ComponentType } from "react";
import { SplitScreenPreview } from "@/components/previews";

export type ViewType = "split" | "full" | "coverFlow";

export interface ViewConfigDef {
  component: ComponentType<any>;
  type: ViewType;
  title: string;
  isSplitScreen?: boolean;
  preview?: SplitScreenPreview;
  disableLongPress?: boolean;
}

/** Forces TypeScript to flatten intersections into a single resolved object type. */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type ViewConfig<T extends ComponentType<any>> = Prettify<
  Omit<ViewConfigDef, "component"> & { component: T }
>;

export function defineView<T extends ComponentType<any>>(
  config: ViewConfig<T>
) {
  return config;
}
