import React, { Component } from 'react';

import Block from './Block'

class Job extends Component {
  render() {
    return (
      <div onClick={this.props.onClick} style={{
        textAlign: "left", borderStyle: this.props.selected? "none" : "solid", padding: 7,
        backgroundColor: this.props.selected? "white" : "grey"
      }}>
        20 - Length: 100, {this.props.holes} <span style={{float: "right"}}>Remove</span>
      </div>
    )
  }
}

class Jobs extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      jobs: [
        {
          id: 12,
          holes: [
            50, 100, 150
          ]
        },
        {
          id: 15,
          holes: [
            100, 200
          ]
        },
        {
          id: 16,
          holes: [
            150
          ]
        },
        {
          id: 17,
          holes: [
            100, 200, 300
          ]
        }
      ],
      selected: 12
    }
  }

  render() {
    let current
    for (current of this.state.jobs) {
      if (current.id == this.state.selected) {
        break
      }
    }
    
    return (
    <div style={{display: "flex", flexDirection: "row", width: "100%", height: "100%"}}>
      <div style={{padding: "30px 0px 0px 40px", flex: 1}}>
        <div style={{fontSize: 20, paddingBottom: 10}}>
          Queue
        </div>
        <div style={{ backgroundColor: "black", padding: 6}}>
          {
            this.state.jobs.map(({id, holes}) => {
              return(
                <Job holes={holes} key={id} selected={this.state.selected==id} onClick={() => this.setState({selected: id})} />
              )
            })
          }
        </div>
      </div>
      <div style={{padding: "50px 60px 0px 50px"}}>
        <Block holes={current.holes}/>
      </div>
    </div>
    );
  }
}

export default Jobs;
