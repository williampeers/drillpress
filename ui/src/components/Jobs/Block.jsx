import React, { Component } from 'react';
// import './index.css';

import { Stage, Layer, Rect, Circle } from 'react-konva';
import Konva from 'konva';
import { Link, Route } from 'react-router-dom'

const offset = {x: 10, y: 10}

class Hole extends Component {
  render() {
    return (
      <Circle
        fill={"white"}
        {... this.props}
      />
    )
  }
}

export default class Block extends Component {
  constructor() {
    super()
    this.state = {
      length: 300,
      width: 100,
    }
  }
  render() {
    return (
      <Stage width={this.state.width} height={this.state.length}>
        <Layer>
          <Rect
            width={this.state.width}
            height={this.state.length}
            fill={"#aB6023"}
          />
          {
            this.props.holes.map((y) => {
              return(
              <Hole
                x={Math.round(this.state.width/2)}
                y={Math.round(y)}
                radius={8}
              />
              )
            })
          }
        </Layer>
      </Stage>
    )   
  }
}