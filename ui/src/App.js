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

class App extends Component {
  render() {
    return (
      <BrowserRouter>
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
      </BrowserRouter>
    );
  }
}

export default App;