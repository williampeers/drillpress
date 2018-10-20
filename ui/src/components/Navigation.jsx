import React, { Component } from 'react';

import {  Link, Route } from 'react-router-dom'

class NavLink extends Component {
  render () {
    return (
      <Route
        path={this.props.to}
        exact
        children={({ match }) => (
          <Link className={match ? "NavLink active" : "NavLink"} to={this.props.to}>{this.props.children}</Link>
        )}
      />
    )
  }
}


class Navigation extends Component {
  render() {
    return (
    <div className="Navigation">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/jobs">Jobs</NavLink>
      <NavLink to="/manual">Manual</NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </div>
    );
  }
}

export default Navigation;
