import React, { Component } from "react";
import styles from "./App.module.scss";

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.background}>
          <input
            className={styles.mainInput}
            placeholder="What are your preferences?"
          />
        </div>
      </div>
    );
  }
}

export default App;
