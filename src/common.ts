import { castArray, each, isMatch, isString } from "lodash";
import { LayoutAxis } from "plotly.js";

const PRELOADED = {
  "": "/data/default.json",

  "positive and toxic": "/data/positive_and_toxic.json",
  "positive or negative": "/data/positive_or_negative.json",
  "identity_hate and insult": "/data/identity_hate_and_insult.json",
  "toxic or severe_toxic or obscene or threat or insult or identity_hate":
    "/data/any_toxicity.json",

  'body.str.contains("Brazil")': "/data/brazil.json",
};

/**
 * Appends a path to the back-end URL.
 *
 * @param path The sub-resource path components.
 * @returns A new, fully qualified URL to the resource.
 */
export function buildURL(
  path: string,
  params: { [key: string]: string | string[] }
): string {
  if (window.location.hostname === "rphln.github.io") {
    const query = params.query as keyof typeof PRELOADED | undefined;

    if (isString(query) && query in PRELOADED) {
      return PRELOADED[query];
    }
  }

  const url = new URL(path, "http://127.0.0.1:8000/");

  each(params, (value, key) => {
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
