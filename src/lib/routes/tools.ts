/** נתיבים יחסיים לשורש האתר הסטטי (ללא /tools). */
export const TOOL_ROUTES = {
  index: "/",
  business: "/business",
  "brand-colors": "/brand-colors",
  quote: "/quote",
} as const;

export type ToolRouteKey = keyof typeof TOOL_ROUTES;
