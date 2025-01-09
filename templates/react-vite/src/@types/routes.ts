import { RouteObject } from "react-router";
import { OverrideProperties } from "type-fest";

export type CustomRouteDefinition = {
  path: string;
  label: string;
};

export type ReactRouterRouteDefinition<Routes extends CustomRouteDefinition[]> =
  OverrideProperties<
    RouteObject,
    {
      path: Routes[number]["path"] | "*";
      handle: ReactRouterRouteHandleDefinition;
    }
  >;

export type ReactRouterRouteHandleDefinition = {
  metadata: {
    title: string;
    description?: string;
  };
  [K: string]: unknown;
};
