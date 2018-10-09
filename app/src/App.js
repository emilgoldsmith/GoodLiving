import React, { Component } from "react";
import styles from "./App.module.scss";

class App extends Component {
  render() {
    let x = 0;
    return (
      <div className={styles.appContainer}>
        <div className={styles.map}>
          <div className={styles.topContainer}>
            <div className={styles.inputContainer}>
              <input
                className={styles.mainInput}
                placeholder="What are you looking for?"
              />
              <div className={styles.suggestion}>Select Location</div>
              <div className={styles.suggestion}>Select Price Range</div>
            </div>
          </div>
        </div>
        <div className={styles.sidebarContainer}>
          <h2>Filters</h2>
          <div>
            {new Array(8).fill(0).map(_i => (
              <div key={x++} className={styles.preference}>
                <div className={`${styles.iconContainer} ${styles.gymIcon}`}>
                  <i className="fas fa-dumbbell" />
                </div>
                Gym Nearby
                <button className={styles.unstyledButton}>
                  <i className="fas fa-times" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
