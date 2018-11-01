import React, { Component } from "react";
import styles from "./MainInput.module.scss";

export default class MainInput extends Component {
  render() {
    if (true) {
      return (
        <div className={styles.inputContainer}>
          <input
            className={styles.mainInput}
            placeholder="What are you looking for?"
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
