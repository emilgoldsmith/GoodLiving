import React, { Component } from "react";
import styles from "./FormInput.module.scss";

const SUGGESTIONS = ["abc", "def", "absafdsa", "dummy1", "dummy2"];

export default class FormInput extends Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: "", displaySuggestions: false };
  }

  render() {
    const suggestions = SUGGESTIONS.filter(x =>
      x.startsWith(this.state.inputValue)
    ).map(x => <div key={x}>{x}</div>);
    return (
      <div className={styles.inputContainer}>
        <input
          list="autocomplete"
          value={this.state.inputValue}
          className={styles.input}
          placeholder="Select attribute"
          onChange={e => this.setState({ inputValue: e.target.value })}
          onFocus={() => this.setState({ displaySuggestions: true })}
          onBlur={() => this.setState({ displaySuggestions: false })}
        />
        {this.state.displaySuggestions && (
          <div className={styles.suggestionsContainer}>{suggestions}</div>
        )}
      </div>
    );
  }
}
