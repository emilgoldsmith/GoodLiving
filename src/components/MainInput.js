import React, { Component } from "react";
import styles from "./MainInput.module.scss";
import { geocode } from "../api/geocode/geocode-client";
import { debounce } from "debounce";

// function disableBubbling(e) {
//   e.preventDefault();
//   e.stopPropagation();
// }

class Suggestion extends Component {
  handleClick = () => {
    this.props.moveMap(this.props.suggestion.boundingBox);
    this.props.clearSuggestions();
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
      inputValue: "",
      suggestions: []
    };
  }

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

  generateSuggestions = debounce(async () => {
    const query = this.state.inputValue;
    const results = await geocode(query);
    console.log(results);
    this.setState({
      suggestions: results.slice(0, 3).map(singleResult => ({
        displayName: singleResult.display_name,
        boundingBox: singleResult.boundingbox,
        latitude: singleResult.lat,
        longitude: singleResult.lon
      }))
    });
  }, 500);

  clearSuggestions = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    if (true) {
      return (
        <div className={styles.inputContainer}>
          <input
            className={styles.mainInput}
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            placeholder="What are you looking for?"
            onKeyUp={this.handleInputSubmit}
          />
          {this.state.suggestions.map(suggestion => (
            <Suggestion
              key={`${suggestion.latitude} ${suggestion.longitude}`}
              suggestion={suggestion}
              moveMap={this.props.moveMap}
              clearSuggestions={this.clearSuggestions}
            />
          ))}
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
