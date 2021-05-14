import Plot from "react-plotly.js";
import { map } from "lodash";
import { Data, Layout, PlotMouseEvent } from "plotly.js";
import { Entries, ColorMap } from "./App";
import { makeAxis } from "common";

export function TernaryPlot({
  entries,
  colors,
  layout,
  width,
  height,
  onPointClick,
}: {
  entries: Entries;
  colors: ColorMap;
  layout?: Partial<Layout>;
  width: number;
  height: number;
  onPointClick?: (event: Readonly<PlotMouseEvent>) => void;
}) {
  const data: Data[] = map(entries, (bySubject, sourceName) => ({
    name: sourceName,

    type: "scatterternary",
    mode: "markers",

    a: map(bySubject, "positive_sum"),
    b: map(bySubject, "negative_sum"),
    c: map(bySubject, "neutral_sum"),

    text: map(bySubject, "subject"),

    hovertemplate: `<b>%{text}</b>
    <br />Positive: %{a}
    <br />Negative: %{b}
    <br />Neutral: %{c}
    <extra></extra>`,

    marker: {
      color: colors[sourceName],
      opacity: 0.75,
      size: 15,
    },
  }));

  const baseLayout: Partial<Layout> = {
    title: "Sentiment ratios across subjects",

    width,
    height,

    ternary: {
      aaxis: makeAxis("Positive", { tickformat: ",.0%" }),
      baxis: makeAxis("Negative", { tickformat: ",.0%" }),
      caxis: makeAxis("Neutral", { tickformat: ",.0%" }),
    },
  };

  return (
    <Plot
      data={data}
      layout={{ ...baseLayout, ...layout }}
      onClick={onPointClick}
    />
  );
}
