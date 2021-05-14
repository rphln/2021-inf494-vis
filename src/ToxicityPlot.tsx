import Plot from "react-plotly.js";
import { flatMap, keys, map, values } from "lodash";
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
  type Toxicity = keyof Entry &
    (
      | "toxic_sum"
      | "severe_toxic_sum"
      | "obscene_sum"
      | "threat_sum"
      | "insult_sum"
      | "identity_hate_sum"
    );

  const toxicity: Record<Toxicity, string> = {
    toxic_sum: "Toxic",
    severe_toxic_sum: "Severely toxic",
    obscene_sum: "Obscene",
    threat_sum: "Threat",
    insult_sum: "Insult",
    identity_hate_sum: "Identity hate",
  };

  const data: Data[] = flatMap(entries, (bySubject, sourceName) => {
    return map(bySubject, (subjectStats) => {
      return {
        type: "scatter",
        mode: "lines",

        name: subjectStats.subject,
        text: map(toxicity, (_) => subjectStats.subject),

        hovertemplate: `<b>%{text}</b>
        <br />%{xaxis.title.text}: %{x}
        <br />%{yaxis.title.text}: %{y}
        <extra></extra>`,

        x: values(toxicity),
        y: map(
          keys(toxicity) as Iterable<Toxicity>,
          (key) => subjectStats[key] / subjectStats["body_count"]
        ),

        line: { color: colors[sourceName] },
      };
    });
  });

  const baseLayout: Partial<Layout> = {
    title: "Toxicity ratios across subjects",

    width,
    height,

    hovermode: "closest",

    xaxis: makeAxis("Classification"),
    yaxis: makeAxis("Occurrences", { tickformat: ",.0%" }),
  };

  return (
    <Plot
      data={data}
      layout={{ ...baseLayout, ...layout }}
      onClick={onPointClick}
    />
  );
}
