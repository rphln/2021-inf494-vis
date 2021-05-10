import Plot from "react-plotly.js";
import { flatMap, map } from "lodash";
import { Data, Layout, PlotMouseEvent } from "plotly.js";
import { Entries, ColorMap, Entry } from "./App";
import { makeAxis } from "common";

export function ToxicityPlot({
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
  const x: Array<keyof Entry> = [
    "toxic",
    "severe_toxic",
    "obscene",
    "threat",
    "insult",
    "identity_hate",
  ];

  const data: Data[] = flatMap(entries, (items, name) => {
    return map(items, (d) => {
      return {
        type: "scatter",
        mode: "lines",

        name: d.subject,
        text: map(x, (_) => d.subject),

        hovertemplate: `<b>%{text}</b>
        <br /> %{x}: %{y}
        <extra></extra>`,

        x,
        y: map(x, (key) => (d[key] as number) / d.body),

        line: { color: colors[name] },
      };
    });
  });

  const baseLayout: Partial<Layout> = {
    title: "Toxicity ratios across subjects",

    width,
    height,

    hovermode: "closest",

    xaxis: makeAxis("Kind"),
    yaxis: makeAxis("Ratio", { tickformat: ",.0%" }),
  };

  return (
    <Plot
      data={data}
      layout={{ ...baseLayout, ...layout }}
      onClick={onPointClick}
    />
  );
}
