import React from 'react';
import './../stylesheets/player.scss';

import mui from 'material-ui';
const TableRow = mui.TableRow,
      TableRowColumn = mui.TableRowColumn;

export default class Player extends React.Component {

  constructor(props) {
    super();

    this._handleFadeLock = this._handleFadeLock.bind(this);

    this.state = {
      fade_or_lock: props.fade_or_lock,
    };
  }

  _handleFadeLock(e) {
    let value = e.target.value,
        self = this;

    this.setState({fade_or_lock: value}, () => {
      self.props.handleFadeLock({index: self.props.index, fade_or_lock: value});
    });
  }

  render() {
    return (
      <TableRow className="Player-container">
        <TableRowColumn>{this.props.name}</TableRowColumn>
        <TableRowColumn className="right">${this.props.salary}</TableRowColumn>
        <TableRowColumn>{this.props.team}</TableRowColumn>
        <TableRowColumn>{this.props.opponent}</TableRowColumn>
        <TableRowColumn className="right">{this.props.projection}</TableRowColumn>
        <TableRowColumn>
          <select value={this.state.fade_or_lock} onChange={this._handleFadeLock}>
            <option value=""></option>
            <option value="lock">Lock</option>
            <option value="fade">Fade</option>
          </select>
        </TableRowColumn>
      </TableRow>
      );
  }

};