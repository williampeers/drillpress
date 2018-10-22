import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';


class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.props.socket.on('video', (data) => {this.handleData(data)});
    this.props.socket.on('message', (data) => console.log(data));
    this.props.socket.on('connect', () => console.log("Connected"));
    this.props.socket.on('disconnect', () => console.log("Disonnected"));
  }

  handleData(data) {
    console.log("Received video")
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
    </div>
    );
  }
}

export default socketConnect(Camera);