import React, { Component } from 'react';
// import './index.css';
import { socketConnect } from 'socket.io-react';

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

class Block extends Component {
  constructor(props) {
    super(props)
    this.state = {
      length: 300,
      width: 100,
    }
  }

  render() {
    let width = 100;
    let height = 300;
    if (this.props.horizontal) {
      width = 300;
      height = 100;
    }
    return (
      <Stage width={width} height={height}> 
        <Layer>
          <Rect
            width={width}
            height={height}
            fill={"#aB6023"}
          />
          {
            this.props.holes.map((y) => {
                if (this.props.horizontal) {
                  return(
                    <Hole
                      x={Math.round(y)}
                      y={Math.round(height/2)}
                      radius={8}
                    />
                  )
                } else {
                  return(
                    <Hole
                      x={Math.round(width/2)}
                      y={Math.round(y)}
                      radius={8}
                    />
                  )
                }
            })
          }
        </Layer>
      </Stage>
    )   
  }
}


export default socketConnect(Block);
