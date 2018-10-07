import React, { Component } from "react";
import styles from "./App.module.scss";

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.background} />
      </div>
    );
  }
}

export default App;
