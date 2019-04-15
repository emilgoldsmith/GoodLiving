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

  handleSuggestionClick = (val, meta, isShortcutValue) => {
    const suggestionLevel = this.getSuggestionLevel();
    if (suggestionLevel instanceof Array || isShortcutValue) {
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

    const defaultSuggestionData =
      suggestionLevel instanceof Array
        ? _.values(suggestionLevel)
        : _.keys(suggestionLevel);

    const getStringValue = val => (val._meta || val._display ? val.value : val);
    const getDisplayValue = val =>
      val._display ? val._display : _.startCase(getStringValue(val));

    const getChildrenValues = obj => {
      if (obj instanceof Array)
        return obj.map(x => ({
          ...(typeof x === "string" ? { value: x } : x),
          _display: `: ${getDisplayValue(x)}`
        }));
      return _.map(obj, (val, key) =>
        getChildrenValues(val).map(x => ({
          ...x,
          _display: `${_.startCase(key)}${val instanceof Array ? "" : "->"}${
            x._display
          }`
        }))
      ).reduce((x, y) => x.concat(y));
    };
    // Only consider recursive suggestions if user has input a query and there's something to recurse on
    const advancedSuggestionData =
      this.state.inputValue &&
      !(suggestionLevel instanceof Array) &&
      defaultSuggestionData.concat(getChildrenValues(suggestionLevel));

    const suggestionData = advancedSuggestionData || defaultSuggestionData;

    const suggestions = _.uniqBy(suggestionData, val =>
      getStringValue(val).toLowerCase()
    )
      .sort((a, b) => {
        // Non direct values come last
        if (a._display && !b._display) return 1;
        if (!a._display && b._display) return -1;
        a = getStringValue(a).toLowerCase();
        b = getStringValue(b).toLowerCase();
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
      .filter(x =>
        // Check that input is contained in suggestions
        new RegExp(this.state.inputValue.toLowerCase()).test(
          getStringValue(x).toLowerCase()
        )
      )
      .map(x => (
        <div
          className={styles.suggestion}
          key={getStringValue(x).toLowerCase()}
          onClick={this.handleSuggestionClick.bind(
            this,
            getStringValue(x),
            x._meta,
            x._display
          )}
        >
          {getDisplayValue(x)}
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
          onKeyUp={e =>
            e.key === "Enter" &&
            suggestions.length > 0 &&
            suggestions[0].props.onClick()
          }
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
