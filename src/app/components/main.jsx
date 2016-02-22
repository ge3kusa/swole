/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import TextField from 'material-ui/lib/text-field';
import Paper from 'material-ui/lib/paper';
import Positions from './positions';
import './../stylesheets/main.scss';

export default class Main extends React.Component {

  constructor(props) {
    super();
    this._togglePosition = this._togglePosition.bind(this);
    this.state = {
      search_shown: false,
      positions: props.positions,
      selected_positions_indexes: [0],
    };
  }

  _showSearch(search_shown, e) {
    this.setState({search_shown}, () => {
      if (search_shown) this.refs.search_field.focus();
    });
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
          <Paper zDepth={2}>
            <div className="header">
              { self.state.search_shown &&
                <div className="search_shown">
                  <FontIcon onClick={self._showSearch.bind(self, false)} className="material-icons arrow_back">arrow_back</FontIcon>
                  <FontIcon className="material-icons close">close</FontIcon>
                  <TextField ref="search_field" className="search_field" hintText="Showing all players" underlineShow={false} />
                </div>
              }
              { !self.state.search_shown &&
                <div>
                  <img src="logo.png" />
                  <FontIcon onClick={self._showSearch.bind(self, true)} className="material-icons search">search</FontIcon>
                  <FontIcon onClick={self._showSearch.bind(self, true)} className="material-icons filter_list">filter_list</FontIcon>
                </div>
              }
            </div>
            <div className="filters">
              <Positions togglePosition={self._togglePosition} selected_positions_indexes={self.state.selected_positions_indexes} positions={self.state.positions} />
            </div>
          </Paper>
        </div>
        <div className="middle">
          {/* <Players /> */}
        </div>
      </div>
    );
  }

};

Main.defaultProps = {
  positions: ["PG", "SG", "SF", "PF", "C"], // NBA
  // positions: ["GK", "D", "M", "F"], // SOC
  // positions: ["C", "W", "D", "G"], // NHL
  // positions: ["QB", "RB", "WR", "TE", "D"], // NFL
};