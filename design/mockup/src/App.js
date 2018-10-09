import React, { Component } from "react";
import styles from "./App.module.scss";

class App extends Component {
  render() {
    let x = 0;
    return (
      <div className={styles.app}>
        <div className={styles.background}>
          <div className={styles.topContainer}>
            <div className={styles.inputContainer}>
              <input
                className={styles.mainInput}
                placeholder="What are your preferences?"
              />
              <div className={styles.suggestion}>Select Location</div>
              <div className={styles.suggestion}>Select Price Range</div>
            </div>
            <div className={styles.preferencesContainer}>
              {new Array(8).fill(0).map(_i => (
                <div key={x++} className={styles.preference}>
                  <div className={`${styles.iconContainer} ${styles.gymIcon}`}>
                    <i className="fas fa-dumbbell" />
                  </div>{" "}
                  Gym Nearby{" "}
                  <button className={styles.unstyledButton}>
                    <i className="fas fa-times" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
