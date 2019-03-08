import React, { Component } from "react";
import { Range } from "rc-slider";

export default class ChooseDistanceModal extends Component {
  render() {
    const marks = { 0: "0m" };
    for (let i = 1; i <= 50 / 10; i++) {
      const label = i > 2 ? `${10 ** (i - 3)}km` : `${10 ** i}m`;
      marks[i * 10] = label;
    }
    console.log(marks);
    return (
      <div>
        <Range
          min={0}
          max={50}
          count={1}
          pushable
          value={[0, 50]}
          marks={marks}
        />
      </div>
    );
  }
}
