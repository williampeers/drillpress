import React, { Component } from 'react';
import Websocket from 'react-websocket';

class Camera extends Component {
  constructor(props) {
    super(props);
  }

  handleData(data) {
    this.setState({video_data: data});
  }

  render() {
    let img = null
    if (this.state.video_data) {
      img = <img src={`data:image/jpeg;base64,${this.state.video_data}`} />
    }
    return (
    <div className="Camera">
      {img}
      <Websocket url='ws://localhost:8888/video' onMessage={this.handleData.bind(this)}/>
    </div>
    );
  }
}

export default Header;