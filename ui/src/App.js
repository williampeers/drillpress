import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Route } from 'react-router-dom'

import Header from './components/Header'
import Navigation from './components/Navigation'
import Home from './components/Home'
import Jobs from './components/Jobs/'
import Manual from './components/Manual'
import Settings from './components/Settings'
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';

const socket = io.connect("192.168.0.100:8000");
 
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <SocketProvider socket={socket}>
          <div className="App">
            <Header />
            <div className="Body" style={{display: "flex", flexDirection: "row", width: "100vw"}}>
              <Navigation />
              <div style={{display: "flex", flexDirection: "row", flex: 1}}>
                <Route exact path="/" component={Home} />
                <Route path="/jobs" component={Jobs} />
                <Route path="/manual" component={Manual} />
                <Route path="/settings" component={Settings} />
              </div>
            </div>
          </div>
        </SocketProvider>
      </BrowserRouter>
    );
  }
}

export default App;