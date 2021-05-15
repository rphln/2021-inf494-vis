import { castArray, each } from "lodash";
import { LayoutAxis } from "plotly.js";

/**
 * Appends a path to the back-end URL.
 *
 * @param path The sub-resource path components.
 * @returns A new, fully qualified URL to the resource.
 */
export function buildURL(
  path: string,
  query: { [key: string]: string | string[] }
): string {
  const url = new URL(path, "http://127.0.0.1:8000/");

  each(query, (value, key) => {
    each(castArray(value), (entry) => {
      url.searchParams.append(key, entry);
    });
  });

  return url.href;
}

/**
 * Returns the specification for an axis.
 */
export function makeAxis(
  title: string,
  template: Partial<LayoutAxis> = {}
): Partial<LayoutAxis> {
  return {
    title,

    ...template,

    gridcolor: "GhostWhite",
    linecolor: "GhostWhite",
    tickcolor: "GhostWhite",
  };
}
