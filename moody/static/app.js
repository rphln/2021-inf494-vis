document.addEventListener("DOMContentLoaded", async () => {
  const application = Stimulus.Application.start();

  const colorMap = {
    Reddit: "#FE6100",
    Telegram: "#648FFF",
  };

  class App extends Stimulus.Controller {
    static get targets() {
      return ["chart"];
    }

    connect() {
      d3.csv("/data/").then((rawData) => {
        const parseDataset = (rawData) => {
          const subjects = _.groupBy(rawData, "subject");

          return _.map(subjects, (entries, label) => {
            const reducer = (group, { sentiment, count }) => {
              return _.set(group, sentiment, _.parseInt(count));
            };

            return _.reduce(entries, reducer, { label });
          });
        };

        const sources = _.groupBy(rawData, "dataset");
        const plots = _.map(sources, (data, name) => {
          const dataset = parseDataset(data);

          return {
            name,

            type: "scatterternary",
            mode: "markers",

            a: dataset.map((d) => d.positive),
            b: dataset.map((d) => d.negative),
            c: dataset.map((d) => d.neutral),

            text: dataset.map((d) => d.label),

            marker: {
              color: colorMap[name],
              symbol: "circle-open",
              size: 20,
              // opacity: 0.5,
            },
          };
        });

        const config = { responsive: true, staticPlot: false };

        const makeAxis = (title) => ({
          title,

          titlefont: { size: 20 },
          tickfont: { size: 15 },

          gridcolor: "Gainsboro",
          linecolor: "Gainsboro",
        });

        const layout = {
          hovermode: "closest",
          ternary: {
            aaxis: makeAxis("Positive"),
            baxis: makeAxis("Negative"),
            caxis: makeAxis("Neutral"),
          },
        };

        Plotly.newPlot(this.chartTarget, plots, layout, config);
      });
    }
  }

  application.register("app", App);
});
