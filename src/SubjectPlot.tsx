import Plot from "react-plotly.js";
import { map } from "lodash";
import { Data, Layout, PlotMouseEvent } from "plotly.js";
import { Entries, ColorMap } from "./App";
import { makeAxis } from "common";

export function SubjectPlot({
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
  const data: Data[] = map(entries, (bySubject, sourceName) => {
    return {
      type: "bar",

      name: sourceName,
      text: map(bySubject, "subject"),

      hovertemplate: `<b>%{text}</b>
        <br />Entries: %{y}
        <extra></extra>`,

      x: map(bySubject, "subject"),
      y: map(bySubject, "body_count"),

      marker: { color: colors[sourceName] },
    };
  });

  const baseLayout: Partial<Layout> = {
    title: "Subject ratios across subjects",

    width,
    height,

    hovermode: "closest",

    xaxis: makeAxis("Subject"),
    yaxis: makeAxis("Occurrences"),
  };

  return (
    <Plot
      data={data}
      layout={{ ...baseLayout, ...layout }}
      onClick={onPointClick}
    />
  );
}
