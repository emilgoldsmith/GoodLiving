import React, { Component } from "react";
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

  render() {
    const marks = { 0: "0m" };
    for (let i = 1; i <= this.maxPos; i++) {
      const label = i > 2 ? `${10 ** (i - 3)}km` : `${10 ** i}m`;
      marks[i] = label;
    }
    return (
      <div>
        <Range
          min={this.minPos}
          max={this.maxPos}
          count={1}
          step={0.01}
          marks={marks}
          pushable
          value={this.state.posRange}
          onChange={this.handleRangeChange}
        />
        {this.getValueRange().map(x => (
          <div key={x} style={{ padding: "100px" }}>
            {x}
          </div>
        ))}
      </div>
    );
  }
}
