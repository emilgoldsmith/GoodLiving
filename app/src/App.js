import React, { Component } from "react";
import styles from "./App.module.scss";

const Filter = ({ iconType }) => {
  let icon, description;
  switch (iconType) {
    case "gym":
      icon = (
        <div className={`${styles.iconContainer} ${styles.gymIcon}`}>
          <i className="fas fa-dumbbell" />
        </div>
      );
      description = "Gym Nearby";
      break;

    default:
      throw new Error("Invalid iconType");
  }

  return (
    <div className={styles.filter}>
      {icon}
      {description}
      <button className={styles.unstyledButton}>
        <i className="fas fa-times" />
      </button>
    </div>
  );
};

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
              <Filter iconType="gym" key={x++} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
