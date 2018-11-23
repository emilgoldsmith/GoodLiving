import React, { Component } from "react";
import styles from "./MainInput.module.scss";
import { geocode } from "../api/geocode/geocode-client";
import { debounce } from "debounce";
import { getTreeSuggestions } from "../lib/query-language-tree";

// function disableBubbling(e) {
//   e.preventDefault();
//   e.stopPropagation();
// }

class Suggestion extends Component {
  handleClick = () => {
    const { suggestion } = this.props;
    if (suggestion.template === "near") {
      this.props.setTemplate("near");
    } else {
      this.props.moveMap(suggestion.boundingBox);
      this.props.clearSuggestions();
    }
  };

  render() {
    const { suggestion } = this.props;
    return (
      <div className={styles.suggestion} onClick={this.handleClick}>
        {suggestion.displayName}
      </div>
    );
  }
}

export default class MainInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTemplate: null,
      inputValue: "",
      suggestions: []
      // suggestions: [
      //   {
      //     template: "near",
      //     displayName: "Require nearby facility"
      //   }
      // ]
    };
  }

  setTemplate = newTemplate => this.setState({ currentTemplate: newTemplate });

  searchLocation = async query => {
    const results = await geocode(query);
    this.props.moveMap(results[0].boundingbox);
    this.clearSuggestions();
  };

  handleInputSubmit = event => {
    event.key === "Enter" && this.searchLocation(event.target.value);
  };

  handleInputChange = event => {
    this.setState(
      {
        inputValue: event.target.value
        // We're using the callback here so we're sure state has updated before calling generateSuggestions
      },
      this.generateSuggestions
    );
  };

  async generateSuggestions() {
    // const suggestions = getTreeSuggestions(query.split(" ").filter(x => x));
    // const stringSuggestions = suggestions.map(
    //   x => x.stringValue || x.placeholder
    // );
    // return stringSuggestions.map(x => ({ displayName: x }));

    const results = await geocode(this.state.inputValue);
    this.setState({
      suggestions: results.slice(0, 3).map(singleResult => ({
        displayName: singleResult.display_name,
        boundingBox: singleResult.boundingbox,
        latitude: singleResult.lat,
        longitude: singleResult.lon
      }))
    });
  }

  clearSuggestions = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    if (true) {
      const suggestions = this.state.suggestions.map(suggestion => (
        <Suggestion
          key={`${suggestion.latitude} ${suggestion.longitude} ${
            suggestion.displayName
          }`}
          suggestion={suggestion}
          moveMap={this.props.moveMap}
          clearSuggestions={this.clearSuggestions}
          setTemplate={this.setTemplate}
        />
      ));
      let inputBar;
      if (this.state.currentTemplate) {
        inputBar = (
          <div className={styles.mainInput}>
            Near{" "}
            <select defaultValue="gym">
              <option value="gym">Gym</option>
            </select>
            <button>Apply</button>
            <button onClick={this.setTemplate.bind(this, null)}>Reset</button>
          </div>
        );
      } else {
        inputBar = (
          <input
            className={styles.mainInput}
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onFocus={this.handleInputChange}
            placeholder="Input location"
            onKeyUp={this.handleInputSubmit}
          />
        );
      }
      return (
        <div className={styles.inputContainer}>
          {inputBar}
          {suggestions}
        </div>
      );
    } else {
      return (
        <div className={styles.inputContainer}>
          <div
            className={styles.mainInput}
            placeholder="What are you looking for?"
          >
            Between <input type="number" /> and <input type="number" />{" "}
            <input type="text" defaultValue="USD" />
          </div>
          <div className={styles.suggestion}>Select Location</div>
          <div className={styles.suggestion}>Select Price Range</div>
        </div>
      );
    }
  }
}
