import React, { Component } from 'react';

import Keyboard from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';

const drillButtonStyle = {
  width: 100,
  height: 80,
  margin: 10
}

class Manual extends Component {
  constructor(props) {
    super(props)
    this.state = {
      linearHeight: 0,
      drillDepth: 50
    }
  }
  render() {
    return (
    <div style={{padding: 20}}>
      <div>
        <div>
          <button style={drillButtonStyle}>Drill down</button>
          <button style={drillButtonStyle}>Drill up</button>
        </div>
        Drill Depth: <input style={{width: 80, padding: 2}} value={this.state.drillDepth} />
      </div>
      <div style={{marginTop: 40}}>
        <input value={this.state.linearHeight} />
        <button>Move block</button>
      </div>
    </div>
    );
  }
}

export default Manual;
