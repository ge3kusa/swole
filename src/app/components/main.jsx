/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import Positions from './positions';
import './../stylesheets/main.scss';

export default class Main extends React.Component {

  constructor(props) {
    super();
    this._togglePosition = this._togglePosition.bind(this);
    this.state = {
      positions: props.positions,
      selected_positions_indexes: [0],
    };
  }

  _togglePosition(position_idx) {
    let idx = this.state.selected_positions_indexes.indexOf(position_idx);
    if (idx > -1) {
      this.state.selected_positions_indexes.splice(idx, 1);
    } else {
      this.state.selected_positions_indexes.push(position_idx);
    }
    this.setState(this.state);
  }

  render() {
    let self = this;
    return (
      <div className="Main-container">
        <div className="top">
          <div className="header">
            <img src="logo.png" height="20" />
          </div>
          <div className="filters">
            <Positions togglePosition={self._togglePosition} selected_positions_indexes={self.state.selected_positions_indexes} positions={self.state.positions} />
            <input type="search" placeholder="Search ..." />
          </div>
        </div>
        <div className="middle">
          {/* <Players /> */}
        </div>
      </div>
    );
  }

};

Main.defaultProps = {
  positions: ["PG", "SG", "SF", "PF", "C"],
};