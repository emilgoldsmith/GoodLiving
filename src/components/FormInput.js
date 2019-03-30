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

  handleSuggestionClick = (val, meta) => {
    const suggestionLevel = this.getSuggestionLevel();
    if (suggestionLevel instanceof Array) {
      this.props.addFilter(val, meta);
      this.setState({
        inputValue: "",
        suggestionPath: [],
        displaySuggestions: false
      });
    } else {
      this.setState(state => ({
        suggestionPath: state.suggestionPath.concat([val.toLowerCase()]),
        inputValue: ""
      }));
    }
  };

  goBack = () => {
    this.setState(state => ({
      suggestionPath: state.suggestionPath.slice(
        0,
        state.suggestionPath.length - 1
      )
    }));
  };

  hideSuggestions = () =>
    this.setState({ displaySuggestions: false, suggestionPath: [] });

  render() {
    const suggestionLevel = this.getSuggestionLevel();

    const suggestionData =
      suggestionLevel instanceof Array
        ? _.values(suggestionLevel)
        : _.keys(suggestionLevel);

    const getStringValue = val => (val._meta ? val.value : val);

    const suggestions = _.uniqBy(suggestionData, val =>
      getStringValue(val).toLowerCase()
    )
      .sort((a, b) => {
        a = getStringValue(a).toLowerCase();
        b = getStringValue(b).toLowerCase();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .filter(
        x =>
          // Check that input is contained in suggestions
          new RegExp(this.state.inputValue.toLowerCase()).test(
            getStringValue(x).toLowerCase()
          ) &&
          getStringValue(x).toLowerCase() !==
            this.state.inputValue.toLowerCase()
      )
      .map(x => (
        <div
          className={styles.suggestion}
          key={getStringValue(x).toLowerCase()}
          onClick={this.handleSuggestionClick.bind(
            this,
            getStringValue(x),
            x._meta
          )}
        >
          {_.startCase(getStringValue(x))}
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
        {this.state.displaySuggestions && (
          <div className={styles.suggestionsContainer}>
            <div className={styles.buttonContainer}>
              <div
                className={styles.backButton}
                style={
                  this.state.suggestionPath.length === 0
                    ? {
                        visibility: "hidden"
                      }
                    : {}
                }
                onClick={this.goBack}
              >
                {"<"}
              </div>
              <div className={styles.hideButton} onClick={this.hideSuggestions}>
                {"x"}
              </div>
            </div>
            {suggestions}
          </div>
        )}
      </div>
    );
  }
}
