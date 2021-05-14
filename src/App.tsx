import "bulma/bulma.sass";

import { Component, FormEventHandler, MouseEventHandler } from "react";
import { groupBy } from "lodash";

import { QueryDatasetShortcuts, QueryDatasetForm } from "./QueryDatasetForm";
import { buildURL } from "./common";
import { Tabbed } from "./Tabbed";
import { TernaryPlot } from "./TernaryPlot";
import { ToxicityPlot } from "./ToxicityPlot";
import { SubjectPlot } from "./SubjectPlot";

export type Entry = {
  subject: string;
  dataset: string;
  positive_sum: number;
  negative_sum: number;
  neutral_sum: number;
  body_count: number;
  body_choice: number;
  toxic_sum: number;
  severe_toxic_sum: number;
  obscene_sum: number;
  threat_sum: number;
  insult_sum: number;
  identity_hate_sum: number;
};

export type Entries = {
  [source: string]: Entry[];
};

export type ColorMap = {
  [source: string]: string;
};

type AppState = {
  isLoading: boolean;
  query?: string;
  error?: string;
  entries: Entries;
};

const [width, height] = [1280, 800];

class App extends Component<{}, AppState> {
  /**
   * @see QueryDatasetForm
   */
  private queryInput?: HTMLInputElement;

  /**
   * @see QueryDatasetForm
   */
  private appendQuery?: (value: string) => void;

  constructor(props: {}) {
    super(props);

    this.state = {
      query: "",
      isLoading: true,
      entries: {},
    };
  }

  /**
   * The fields which are available on the quick dial.
   */
  private static quickDialFields = [
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

  static colorMap: ColorMap = {
    Reddit: "#FE6100",
    Telegram: "#648FFF",
  };

  async refresh() {
    this.setState({ isLoading: true }, async () => {
      const endpoint = buildURL("/", { query: this.state.query ?? "" });

      const response = await fetch(endpoint);
      const { data, detail } = await response.json();

      const state = {
        isLoading: false,
      };

      if (!response.ok) {
        return this.setState({ ...state, error: detail });
      }

      this.setState({
        ...state,
        error: undefined,
        entries: groupBy(data, "dataset"),
      });
    });
  }

  async componentDidMount() {
    return await this.refresh();
  }

  /**
   * Creates an event handler to append a `value` to the query text input.
   *
   * @param value The value which will be appended.
   * @returns The event handler.
   */
  private onShortcutClick =
    (value: string): MouseEventHandler<HTMLButtonElement> =>
    (event) => {
      event.preventDefault();
      return this.appendQuery?.call(undefined, value);
    };

  /**
   * Called when a point in a graph is clicked.
   */
  private onPointClick = ({ points: [{ text }] }: any) =>
    this.appendQuery?.call(undefined, `"${text}",`);

  /**
   * Handles the query form submission.
   */
  private handleQuerySubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    this.setState({ query: this.queryInput?.value }, () => {
      this.refresh();
    });
  };

  render() {
    const { error, entries, isLoading } = this.state ?? {};

    const components = {
      Subject: (
        <SubjectPlot
          width={width}
          height={height}
          entries={entries}
          colors={App.colorMap}
          onPointClick={this.onPointClick}
        />
      ),
      Toxicity: (
        <ToxicityPlot
          width={width}
          height={height}
          entries={entries}
          colors={App.colorMap}
          onPointClick={this.onPointClick}
        />
      ),
      Sentiment: (
        <TernaryPlot
          width={width}
          height={height}
          entries={entries}
          colors={App.colorMap}
          onPointClick={this.onPointClick}
        />
      ),
    };

    return (
      <>
        <section className="section">
          <div className="box">
            <div className="block">
              <QueryDatasetForm
                error={error}
                isLoading={isLoading}
                onSubmit={this.handleQuerySubmit}
                refQueryInput={(element) => (this.queryInput = element)}
                refAppendQuery={(appendQuery) =>
                  (this.appendQuery = appendQuery)
                }
              />
            </div>

            <QueryDatasetShortcuts
              fields={App.quickDialFields}
              onShortcutClick={this.onShortcutClick}
            />
          </div>
        </section>

        <Tabbed
          id="graph"
          components={components}
          initial="Toxicity"
          minHeight={height}
        />
      </>
    );
  }
}

export default App;
