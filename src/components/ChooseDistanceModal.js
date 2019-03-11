import React, { Component } from "react";
import styles from "./ChooseDistanceModal.module.scss";
import { Range } from "rc-slider";

export default class ChooseDistanceModal extends Component {
  constructor(props) {
    super(props);
    this.minPos = 0;
    this.maxPos = 5;
    this.state = {
      posRange: [
        props.filterData.minDist === undefined
          ? this.minPos
          : this.valueToPos(props.filterData.minDist),
        props.filterData.maxDist === undefined
          ? this.maxPos * 100
          : this.valueToPos(props.filterData.maxDist)
      ]
    };
  }

  getValueRange = () => {
    return this.state.posRange.map(this.posToValue);
  };

  posToValue = position => {
    if (position === 0) return 0;
    return 10 ** (position / 100);
  };

  valueToPos(value) {
    if (value === 0) return 0;
    return 100 * Math.log10(value);
  }

  handleRangeChange = newRange => {
    this.setState({ posRange: newRange });
  };

  handleSubmit = () =>
    this.props.submitDistance({
      ...this.props.filterData,
      distances: this.getValueRange()
    });

  metersToDisplayString(dist, useDecimals = true) {
    if (dist >= 1000) return `${(dist / 1000).toFixed(useDecimals ? 3 : 0)}km`;
    return `${dist.toFixed(0)}m`;
  }

  render() {
    const marks = { 0: "0m" };
    for (let i = 1; i <= this.maxPos; i++) {
      const label = this.metersToDisplayString(10 ** i, false);
      marks[i * 100] = label;
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
          max={this.maxPos * 100}
          count={1}
          step={1}
          marks={marks}
          pushable
          value={this.state.posRange}
          onChange={this.handleRangeChange}
        />
        <div className={styles.ButtonsContainer}>
          <button className={styles.SubmitButton} onClick={this.handleSubmit}>
            Submit
          </button>
          <button onClick={this.props.closeModal}>Cancel</button>
        </div>
      </div>
    );
  }
}
