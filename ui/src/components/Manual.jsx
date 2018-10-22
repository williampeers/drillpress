import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';

const drillButtonStyle = {
  width: 100,
  height: 80,
  margin: 10
}

class Manual extends Component {
  constructor(props) {
    super(props)
    this.state = {
      linearMoveto: 0,
      drillMoveto: 0
    }
  }
  render() {
    return (
      <div>
        <div style={{padding: 20, display: 'flex', flexDirection: 'row'}}>
          <div style={{padding: 20}}>
            Drill
            <div>
              <button className="button" style={drillButtonStyle} onClick={() => {this.props.socket.emit('drill_extend')}}>Drill extend</button>
              <button className="button" style={drillButtonStyle} onClick={() => {this.props.socket.emit('drill_retract')}}>Drill retract</button>
            </div>
          </div>
          <div style={{padding: 20}}>
            <div>
              <div>
              Move Drill To
              </div>
              <div style={{padding: 10}}>
              <div>
                Depth: <input style={{width: 80, padding: 2}} onChange={({target}) => this.setState({drillMoveto: target.value})} value={this.state.drillMoveto} />
              </div>
              <div>
              <button className="button" onClick={() => {this.props.socket.emit('drill_moveto', this.state.drillMoveto)}}>Move</button>
              </div>
            </div>
          </div>
        </div>
        </div>
        <div style={{padding: 20, display: 'flex', flexDirection: 'row'}}>
          <div style={{padding: 20}}>
            Move Linear
            <div>
              <button className="button" style={drillButtonStyle} onClick={() => {this.props.socket.emit('linear_down')}}>Linear Down</button>
              <button className="button"  style={drillButtonStyle} onClick={() => {this.props.socket.emit('linear_up')}}>Linear Up</button>
            </div>
          </div>
          <div style={{padding: 20}}>
            <div>
              <div>
              Move Linear To
              </div>
              <div style={{padding: 10}}>
              Target: <input style={{width: 80, padding: 2}} onChange={({target}) => this.setState({linearMoveto: target.value})} value={this.state.linearMoveto} />
              </div>
              <div>
                <button className="button" onClick={() => {this.props.socket.emit('linear_moveto', this.state.linearMoveto)}}>Move</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default socketConnect(Manual);
