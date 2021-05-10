import { Component, FormEventHandler } from "react";
import Plot from "react-plotly.js";

import "bulma/bulma.sass";
import { flatMap, groupBy, map } from "lodash";
import { Data, Layout } from "plotly.js";

type Entry = {
  subject: string;
  dataset: string;
  positive: number;
  negative: number;
  neutral: number;
  body: number;
  toxic: number;
  severe_toxic: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_hate: number;
};

type Entries = {
  [source: string]: Entry[];
};

type ColorMap = {
  [source: string]: string;
};

type AppState = {
  query?: string;
  error?: string;
  entries: Entries;
};

const makeAxis = (title: string) => {
  return {
    title,

    titlefont: { size: 20 },
    tickfont: { size: 15 },

    gridcolor: "Gainsboro",
    linecolor: "Gainsboro",
    tickcolor: "Gainsboro",
  };
};

function ToxicityPlot({
  entries,
  colors,
}: {
  entries: Entries;
  colors: ColorMap;
}) {
  const data: Data[] = flatMap(entries, (items, name) => {
    return map(items, (d) => {
      return {
        name: d.subject,

        type: "scatter",
        mode: "lines",

        x: [
          "toxic",
          "severe_toxic",
          "obscene",
          "threat",
          "insult",
          "identity_hate",
        ],
        y: [
          d.toxic / d.body,
          d.severe_toxic / d.body,
          d.obscene / d.body,
          d.threat / d.body,
          d.insult / d.body,
          d.identity_hate / d.body,
        ],

        marker: {
          color: colors[name],
          opacity: 0.75,
          size: 15,
        },
      };
    });
  });

  const layout = {
    hovermode: "closest",

    width: 1280,
    height: 720,

    xaxis: makeAxis("Toxicity"),
    yaxis: makeAxis("Ratio"),
  } as Layout;

  return <Plot data={data} layout={layout} />;
}

function TernaryPlot({
  entries,
  colors,
}: {
  entries: Entries;
  colors: ColorMap;
}) {
  const ternaries: Data[] = map(entries, (items, name) => ({
    name,

    type: "scatterternary",
    mode: "markers",

    a: map(items, "positive"),
    b: map(items, "negative"),
    c: map(items, "neutral"),

    text: map(items, "subject"),

    hovertemplate: `%{text}
    <br />Positive: %{a}
    <br />Negative: %{b}
    <br />Neutral: %{c}`,

    marker: {
      color: colors[name],
      opacity: 0.75,
      size: 15,
    },
  }));

  const layout = {
    width: 1280,
    height: 720,

    ternary: {
      aaxis: makeAxis("Positive"),
      baxis: makeAxis("Negative"),
      caxis: makeAxis("Neutral"),
    },
  };

  return <Plot data={ternaries} layout={layout} />;
}

class App extends Component<{}, AppState> {
  queryInput?: HTMLInputElement | null;

  constructor(props: {}) {
    super(props);

    this.state = {
      query: "",
      entries: {},
    };
  }

  static colors: ColorMap = {
    Reddit: "#FE6100",
    Telegram: "#648FFF",
  };

  async refresh() {
    const response = await fetch(
      `http://127.0.0.1:5000/query/${this.state.query}`
    );
    const stats = await response.json();

    if (!response.ok) {
      return this.setState({ error: stats.error });
    }

    this.setState({
      entries: groupBy(stats.data, "dataset"),
    });
  }

  async componentDidMount() {
    return await this.refresh();
  }

  /**
   * Handles the query form submission.
   */
  private handleQuerySubmit: FormEventHandler<HTMLFormElement> = (
    event
  ) => {
    console.log(this.queryInput?.value);
    event.preventDefault();

    this.setState({ query: this.queryInput?.value }, () => {
      this.refresh();
    });
  };

  /**
   * Creates an event handler to append a `value` to the query text input.
   */
  private appendToQuery = (value: string) => (event: any) => {
    event.preventDefault();

    if (!this.queryInput) return;

    this.queryInput.value += value;
    this.queryInput.focus();
  };

  render() {
    const { error, entries } = this.state;

    const formErrorLabel = error ? (
      <p className="help is-danger">{error}</p>
    ) : (
      <></>
    );

    const fields = [
      "body",
      "dataset",
      "subject",
      "sentiment",
      "positive",
      "negative",
      "neutral",
      "toxic",
      "severe_toxic",
      "obscene",
      "threat",
      "insult",
      "identity_hate",
    ];

    const fieldToButton = (field: string) => (
      <button
        key={field}
        className="button"
        onClick={this.appendToQuery(field)}
      >
        {field}
      </button>
    );

    const formHelpLabel = (
      <div className="buttons has-addons is-centered">{fields.map(fieldToButton)}</div>
    );

    return (
      <>
        <div className="columns is-centered">
          <div className="column is-full">
            <form onSubmit={this.handleQuerySubmit}>
              <label className="label" htmlFor="query">
                Query the dataset
              </label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <input
                    ref={(input) => (this.queryInput = input)}
                    className={`input ${error ? "is-danger" : ""}`}
                    name="query"
                    type="text"
                    placeholder="Enter a query"
                  />
                </div>
                <div className="control">
                  <button className="button is-info" type="submit">
                    Query
                  </button>
                </div>
              </div>
              {formErrorLabel}
              {formHelpLabel}
            </form>
          </div>
        </div>
        <div className="columns is-centered">
          <div className="column is-full">
            <TernaryPlot entries={entries} colors={App.colors} />
          </div>
        </div>
        <div className="columns is-centered">
          <div className="column is-full">
            <ToxicityPlot entries={entries} colors={App.colors} />
          </div>
        </div>
      </>
    );
  }
}

export default App;
