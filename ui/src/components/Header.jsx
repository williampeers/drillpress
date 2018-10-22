import React, { Component } from 'react';

import {  Link } from 'react-router-dom'
import { socketConnect } from 'socket.io-react';

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      power: false,
      drill_state: 'idle'
    }
    
    this.props.socket.on('power', (power) => {this.setState({power})})
    this.props.socket.on('drill_state', (drill_state) => {this.setState({drill_state})})
  }

  render() {
    let power
    if (this.state.power) {
      power = <span style={{color: 'white'}}>On</span>
    } else {
      power = <span style={{color: 'white'}}>Off</span>
    }
    let drill_state = <span style={{color: 'white'}}>{this.state.drill_state}</span>
    let start_button = <button style={{width: 60}} onClick={() => {this.props.socket.emit('stop')}}>STOP</button>
    if (this.state.drill_state == 'stopped') {
      start_button = <button style={{width: 60}} onClick={() => {this.props.socket.emit('start')}}>START</button>
    }

    return (
    <header className="Header">
      <h1>
        <Link to="/" 
          style={{
            color: "white",
            textDecoration: "none"
          }}
        >
          Automatic Drill Press
        </Link>
      </h1>
      <div style={{display:'flex', flexDirection: 'row', padding: 10, position: 'absolute', right: 15, fontSize: 16, textAlign: 'left'}}>
        <div style={{paddingRight: 20, width: 120}}>
          Power: <span style={{float: 'right'}}>{power}</span> <br />
          State: <span style={{float: 'right'}}>{drill_state}</span>
        </div>
        {start_button}
      </div>
    </header>
    );
  }
}

export default socketConnect(Header);
