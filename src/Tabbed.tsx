import { Component, MouseEventHandler } from "react";
import { keys, map } from "lodash";

type TabbedProperties = {
  /**
   * The initially selected tab name.
   */
  initial: string;

  /**
   * The minimum height of the container element, to prevent the viewport from jumping around.
   */
  minHeight: number;

  /**
   * A mapping of tab names to tab elements.
   */
  components: {
    [name: string]: JSX.Element;
  };
};

type TabbedState = {
  /**
   * The currently active component.
   */
  active?: string;
};

export class Tabbed extends Component<TabbedProperties, TabbedState> {
  /**
   * Sets the tab whose name matches the specified value as active.
   * @param active The tab to be activated.
   */
  private setActiveTab = (active: string): void => this.setState({ active });

  render() {
    const { active } = this.state ?? {};
    const { initial, components, minHeight } = this.props;

    const activeLabel = active ?? initial;
    const activeComponent = components[activeLabel];

    const makeTabEntry = (name: string) => {
      const tabOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        this.setActiveTab(name);
      };

      const active = activeLabel === name ? "is-active" : "is-light";

      return (
        <button
          key={name}
          onClick={tabOnClick}
          className={`button is-link ${active}`}
        >
          {name}
        </button>
      );
    };

    return (
      <section className="section">
        <nav className="buttons has-addons is-centered">
          {map(keys(components), makeTabEntry)}
        </nav>

        <div style={{ minHeight }}>{activeComponent}</div>
      </section>
    );
  }
}
