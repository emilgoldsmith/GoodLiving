import React, { Component } from "react";
import styles from "./FormInput.module.scss";
import _ from "lodash";

export default class FormInput extends Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: "", displaySuggestions: false };
  }

  handleSuggestionClick = e =>
    this.setState({
      inputValue: e.target.innerText,
      displaySuggestions: false
    });

  render() {
    const suggestions = _.uniq(this.props.data.map(x => x.toLowerCase()))
      .sort()
      .filter(
        x =>
          x.startsWith(this.state.inputValue.toLowerCase()) &&
          x !== this.state.inputValue.toLowerCase()
      )
      .map(x => (
        <div className={styles.suggestion} key={x}>
          {_.startCase(x)}
        </div>
      ));
    return (
      <div className={styles.inputContainer}>
        <input
          list="autocomplete"
          value={this.state.inputValue}
          className={styles.input}
          placeholder={this.props.placeholder}
          onChange={e => this.setState({ inputValue: e.target.value })}
          onFocus={() => this.setState({ displaySuggestions: true })}
          onBlur={() =>
            setTimeout(() => {
              this.setState({ displaySuggestions: false });
            }, 100)
          }
        />
        {this.state.displaySuggestions && suggestions.length > 0 && (
          <div
            className={styles.suggestionsContainer}
            onClick={this.handleSuggestionClick}
          >
            {suggestions}
          </div>
        )}
      </div>
    );
  }
}
