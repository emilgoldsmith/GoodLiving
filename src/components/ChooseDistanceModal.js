import React, { Component } from "react";
import { Range } from "rc-slider";

export default class ChooseDistanceModal extends Component {
  constructor(...props) {
    super(...props);
    this.minPos = 0;
    this.maxPos = 50;
    this.state = {
      posRange: [this.minPos, this.maxPos]
    };
  }

  handleRangeChange = newRange => {
    this.setState({ posRange: newRange });
  };

  render() {
    const marks = { 0: "0m" };
    for (let i = 1; i <= this.maxPos / 10; i++) {
      const label = i > 2 ? `${10 ** (i - 3)}km` : `${10 ** i}m`;
      marks[i * 10] = label;
    }
    return (
      <div>
        <Range
          min={this.minPos}
          max={this.maxPos}
          count={1}
          step={0.1}
          marks={marks}
          pushable
          value={this.state.posRange}
          onChange={this.handleRangeChange}
        />
      </div>
    );
  }
}
