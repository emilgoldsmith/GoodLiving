import React, { Component } from "react";
import styles from "./MainInput.module.scss";
import { geocode } from "../api/geocode/geocode-client";

function disableBubbling(e) {
  e.preventDefault();
  e.stopPropagation();
}

export default class MainInput extends Component {
  searchLocation = async query => {
    const result = await geocode(query);
    this.props.moveMap(result[0].boundingbox);
  };

  render() {
    if (true) {
      return (
        <div className={styles.inputContainer}>
          <input
            className={styles.mainInput}
            placeholder="What are you looking for?"
            onKeyUp={e =>
              e.key === "Enter" && this.searchLocation(e.target.value)
            }
          />
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
