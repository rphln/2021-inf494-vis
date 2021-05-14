import { Component, MouseEventHandler } from "react";
import { keys, map } from "lodash";

type TabbedProperties = {
  /**
   * The HTML `id` attribute of the tab container.
   */
  id: string;

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
    const { id, initial, components, minHeight } = this.props;

    const activeLabel = active ?? initial;
    const activeComponent = components[activeLabel];

    const makeTabEntry = (name: string) => {
      const onClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        this.setActiveTab(name);
      };

      return (
        <li key={name} className={activeLabel === name ? "is-active" : ""}>
          <a href={`#${id}`} role="button" onClick={onClick}>
            {name}
          </a>
        </li>
      );
    };

    return (
      <section id={id} className="section">
        <div className="tabs is-toggle is-centered">
          <ul>{map(keys(components), makeTabEntry)}</ul>
        </div>

        <div style={{ minHeight }}>{activeComponent}</div>
      </section>
    );
  }
}
