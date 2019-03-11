import React from "react";
import styles from "./Spinner.module.scss";

/** HTML and CSS gotten from https://loading.io/spinner/custom/241043/ */

export default () => (
  <div className={`${styles["lds-css"]} ${styles["ng-scope"]}`}>
    <div
      className={styles["lds-spinner"]}
      style={{ width: "100%", height: "100%" }}
    >
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);
