import React, { Component } from "react";
import { debounce } from "throttle-debounce";
import styles from "./MainInput.module.scss";
import { geocode } from "../api/geocode/geocode-client";

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
    // Initializes generateSuggestions
    this.resetDebounce();
  }

  setTemplate = newTemplate => this.setState({ currentTemplate: newTemplate });

  searchLocation = async query => {
    this.clearSuggestions();
    const results = await geocode(query);
    this.props.moveMap(results[0].boundingbox);
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

  handleGenerateSuggestions = async () => {
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
  };

  resetDebounce = () => {
    if (this.generateSuggestions) this.generateSuggestions.cancel();
    // Cancel disables it forever so we recreate a new non-cancelled one. Otherwise we would have to fork the module to create a new method
    this.generateSuggestions = debounce(500, this.handleGenerateSuggestions);
  };

  clearSuggestions = () => {
    this.setState({
      suggestions: [],
      inputValue: ""
    });
    this.resetDebounce();
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
            placeholder="Search for a location"
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
