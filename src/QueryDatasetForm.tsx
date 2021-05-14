import { uniqueId } from "lodash";
import { Component, FormEventHandler, MouseEventHandler } from "react";

type QueryDatasetFormProperties = {
  /**
   * Calls the specified function with a reference to the query input element as the sole argument.
   */
  refQueryInput?: (element: HTMLInputElement) => void;

  /**
   * Calls the specified function with a reference to a function which appends text to the query input element as the sole argument.
   */
  refAppendQuery?: (appendQuery: (value: string) => void) => void;

  /**
   * Called as the inner form is submitted.
   */
  onSubmit: FormEventHandler<HTMLFormElement>;

  /**
   * Whether to disable the submit button with a loading spinner.
   */
  isLoading: boolean;

  /**
   * The HTML `id` for the query input element.
   */
  queryInputId: string;

  /**
   * Whether any error occurred and what should be shown.
   */
  error?: string;
};

export class QueryDatasetForm extends Component<
  QueryDatasetFormProperties,
  {}
> {
  static defaultProps: Partial<QueryDatasetFormProperties> = {
    queryInputId: uniqueId("query-dataset-form-"),
  };

  /**
   * The query input element.
   */
  private queryInput?: HTMLInputElement;

  /**
   * Tracks the input element used for queries.
   * @param element A reference to the input element.
   */
  private setQueryInput = (element: HTMLInputElement) => {
    this.queryInput = element;
    this.props.refQueryInput?.call(undefined, element);
  };

  /**
   * Appends `value` to the query input element contents.
   * @param value The text to be appended.
   */
  private appendQuery = (value: string): undefined => {
    if (!this.queryInput) return;

    this.queryInput.value += value;
    this.queryInput.focus();
  };

  componentDidMount() {
    this.props.refAppendQuery?.call(undefined, this.appendQuery);
  }

  render() {
    const { onSubmit, isLoading, error, queryInputId } = this.props;

    const loading = isLoading ? "is-loading" : "";
    const danger = error ? "is-danger" : "";

    const formErrorLabel = error && (
      <label htmlFor={queryInputId} className="help is-danger">
        {error}
      </label>
    );

    return (
      <form onSubmit={onSubmit}>
        <fieldset className="field has-addons">
          <div className="control is-expanded">
            <input
              id={queryInputId}
              name={queryInputId}
              type="text"
              placeholder="Enter a query expression"
              className={`input ${danger}`}
              ref={this.setQueryInput}
            />

            {formErrorLabel}
          </div>
          <div className="control">
            <button
              className={`button is-link ${loading}`}
              disabled={isLoading}
              type="submit"
            >
              Query
            </button>
          </div>
        </fieldset>
      </form>
    );
  }
}

type QueryDatasetShortcutsProperties = {
  /**
   * The HTML `class` attribute for the parent element.
   */
  className?: string;

  fields: string[];
  onShortcutClick: (value: string) => MouseEventHandler<HTMLButtonElement>;
};

export class QueryDatasetShortcuts extends Component<
  QueryDatasetShortcutsProperties,
  {}
> {
  render() {
    const { fields, onShortcutClick, className } = this.props;

    const fieldToButton = (name: string) => (
      <button key={name} className="button" onClick={onShortcutClick(name)}>
        {name}
      </button>
    );

    return (
      <div className={`buttons has-addons is-centered ${className}`}>
        {fields.map(fieldToButton)}
      </div>
    );
  }
}
