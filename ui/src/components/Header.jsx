import React, { Component } from 'react';

import {  Link } from 'react-router-dom'

class Header extends Component {
  render() {
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
    </header>
    );
  }
}

export default Header;
