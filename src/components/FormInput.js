import React, { Component } from "react";
import styles from "./FormInput.module.scss";
import _ from "lodash";

export default class FormInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      displaySuggestions: false,
      suggestionPath: []
    };
  }

  getSuggestionLevel = () =>
    this.state.suggestionPath.length > 0
      ? _.get(this.props.data, this.state.suggestionPath)
      : this.props.data;

  handleSuggestionClick = e => {
    const suggestionLevel = this.getSuggestionLevel();
    if (suggestionLevel instanceof Array) {
      this.setState({
        inputValue: e.target.innerText,
        displaySuggestions: false
      });
    } else {
      e.persist();
      this.setState(state => ({
        suggestionPath: state.suggestionPath.concat([
          e.target.innerText.toLowerCase()
        ])
      }));
    }
  };

  render() {
    const suggestionLevel = this.getSuggestionLevel();

    const suggestionData =
      suggestionLevel instanceof Array
        ? _.values(suggestionLevel)
        : _.keys(suggestionLevel);

    const suggestions = _.uniq(suggestionData.map(x => x.toLowerCase()))
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
          value={this.state.inputValue}
          className={styles.input}
          placeholder={this.props.placeholder}
          onChange={e => this.setState({ inputValue: e.target.value })}
          onFocus={() => this.setState({ displaySuggestions: true })}
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
