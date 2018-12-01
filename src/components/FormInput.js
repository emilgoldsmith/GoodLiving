import React, { Component } from "react";
import styles from "./FormInput.module.scss";

export default class FormInput extends Component {
  constructor(props) {
    super(props);
    this.state = { inputValue: "" };
  }

  render() {
    return (
      <div className={styles.inputContainer}>
        <input
          list="autocomplete"
          value={this.state.inputValue}
          className={styles.input}
          placeholder="Select attribute"
          onChange={e => this.setState({ inputValue: e.target.value })}
        />
        <div className={styles.suggestionsContainer}>
          {new Array(10).fill(0).map(x => (
            <div key={Math.random()}>Dummy</div>
          ))}
        </div>
      </div>
    );
  }
}
