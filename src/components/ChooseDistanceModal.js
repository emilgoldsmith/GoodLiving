import React, { Component } from "react";
import styles from "./ChooseDistanceModal.module.scss";
import { Range } from "rc-slider";

export default class ChooseDistanceModal extends Component {
  constructor(...props) {
    super(...props);
    this.minPos = 0;
    this.maxPos = 5;
    this.state = {
      posRange: [this.minPos, this.maxPos]
    };
  }

  getValueRange = () => {
    return this.state.posRange.map(this.posToValue);
  };

  posToValue = position => {
    if (position === 0) return 0;
    return 10 ** position;
  };

  handleRangeChange = newRange => {
    this.setState({ posRange: newRange });
  };

  handleSubmit = () =>
    this.props.submitDistance({
      ...this.props.filterData,
      distances: this.getValueRange()
    });

  metersToDisplayString(dist) {
    if (dist >= 1000) return `${(dist / 1000).toFixed(3)}km`;
    return `${dist.toFixed(0)}m`;
  }

  render() {
    const marks = { 0: "0m" };
    for (let i = 1; i <= this.maxPos; i++) {
      const label = this.metersToDisplayString(10 ** i);
      marks[i] = label;
    }
    const valueRange = this.getValueRange().map(this.metersToDisplayString);
    return (
      <div className={styles.Container}>
        <div className={styles.Title}>
          Choose Distance From {this.props.filterData.value}
        </div>
        <div className={styles.DistanceDisplay}>
          {valueRange[0]} - {valueRange[1]}
        </div>
        <Range
          className={styles.Range}
          min={this.minPos}
          max={this.maxPos}
          count={1}
          step={0.01}
          marks={marks}
          pushable
          value={this.state.posRange}
          onChange={this.handleRangeChange}
        />
        <div className={styles.ButtonsContainer}>
          <button className={styles.SubmitButton} onClick={this.handleSubmit}>
            Submit
          </button>
          <button onClick={this.closeModal}>Cancel</button>
        </div>
      </div>
    );
  }
}
