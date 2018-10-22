import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';

import Block from './Block'
import AddJob from './AddJob'

class Job extends Component {

  remove() {
    this.props.socket.emit('remove_job', {id: this.props.id})
  }

  render() {
    let remove_button = this.props.selected? (<button style={{float: "right"}} className="button" onClick={() => {this.remove()}}>Remove</button>) : null
    
    return (
      <div onClick={this.props.onClick} style={{
        textAlign: "left", borderStyle: this.props.selected? "none" : "solid", padding: 7,
        backgroundColor: this.props.selected? "white" : "grey"
      }}>
        Quantity: {this.props.complete}/{this.props.count}, {this.props.holes.length} holes at {this.props.depth}mm depth {remove_button}
      </div>
    )
  }
}

class Jobs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      jobs: [],
      selected_id: 0
    }
    this.props.socket.on('all_jobs', (data) => {this.on_all_jobs(data)});
    this.props.socket.on('message', (data) => console.log(data));
    this.props.socket.emit('all_jobs');
  }

  on_all_jobs(jobs) {
    this.setState({jobs})
  }

  render() {
    let selected_job
    if (this.state.jobs.length != 0) {
      selected_job = this.state.jobs[0]
      for (let job of this.state.jobs) {
        if (job.id == this.state.selected_id) {
          selected_job = job
        }
      }
    }
    
    let empty = "";
    let selected_block
    if (!selected_job) {
      empty = '(empty)'
      selected_block = null
    } else {
      selected_block = <Block holes={selected_job.holes}/>
    }
    
    return (
        <div style={{display: "flex", flexDirection: "row", width: "100%", height: "100%"}}>
          <div style={{padding: "30px 0px 0px 40px", flex: 1}}>
            <div style={{display: "flex", flexDirection: "row", fontSize: 20, paddingBottom: 10, marginLeft: 20}}>
              <div style={{fontSize: 20, paddingBottom: 10}}>
                Queue {empty}
              </div>
              <AddJob />
            </div>
            <div style={{ backgroundColor: "black", padding: 6}}>
              {
                this.state.jobs.map(({id, holes, depth, count, complete}) => {
                  return (
                    <Job socket={this.props.socket} holes={holes} complete={complete} depth={depth} count={count} key={id} id={id} selected={selected_job && selected_job.id==id} onClick={() => this.setState({selected_id : id})} />
                  )
                })
              }
            </div>
          </div>
          <div style={{padding: "50px 60px 0px 50px"}}>
            {selected_block}
          </div>
        </div>
    );
  }
}

export default socketConnect(Jobs);
