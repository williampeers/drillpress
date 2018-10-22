import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';

import Popup from "reactjs-popup";
import Block from './Block'


class AddJob extends Component {
  constructor(props){
    super(props)
    this.state = {
      holes: [],
      depth: 10,
      count: 20,
      holes_str: ""
    }
    // this.set_holes = this.set_holes.bind(this)
  }

  add_job() {
    this.props.socket.emit('add_job', this.state)
  }

  set_holes(str) {
    this.setState({holes_str: str})
    let holes = str.split(/(?:,| )+/)
    let final_holes = []
    for (let hole of holes) {
      if (hole) {
        final_holes.push(hole)
      }
    }
    this.setState({holes: final_holes})
  }

  render() {
    return (
      <Popup closeOnDocumentClick contentStyle={{width: "70%"}}
        trigger={<button className="button" style={{marginLeft: 20, width: 100, alignSelf: 'center'}}>Add Job</button>} 
        modal>
      {close => (
        <div className="modal">
        <a className="close" onClick={close}>
          &times;
        </a>
        <div className="content">
          <div style={{alignItems: 'left', width: 200, padding: 10, paddingRight: 25}}>
            <div className="input">
            Quantity: <input value={this.state.count}  onChange={({target}) => {this.setState({count: target.value})}}/>
            </div>
            <div className="input">
            Hole Depth: <input value={this.state.depth}  onChange={({target}) => {this.setState({depth: target.value})}}/>
            </div>
            <div className="input">
            Holes: <input value={this.state.holes_str}  onChange={({target}) => {this.set_holes(target.value)}}/>
            </div>
          </div>
          <div style={{padding: 20}}>
            <Block holes={this.state.holes} horizontal/>
          </div>
        </div>
          <div className="actions">
            <button className="button" 
              onClick={() => {
                this.add_job()
                close()
              }}
            >
              Add job
            </button>
          </div>
        </div>
      )}
      </Popup>
    )
  }
}

export default socketConnect(AddJob)