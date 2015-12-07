import React from 'react';
import Lineup from './lineup';
import './../stylesheets/lineups.scss';

import mui from 'material-ui';
const Toolbar = mui.Toolbar,
      ToolbarGroup = mui.ToolbarGroup,
      ToolbarSeparator = mui.ToolbarSeparator,
      DropDownMenu = mui.DropDownMenu,
      ToolbarTitle = mui.ToolbarTitle,
      RaisedButton = mui.RaisedButton;

export default class Lineups extends React.Component {

  constructor(props) {
    super();

    this._generateLineups = this._generateLineups.bind(this);
  }

  _generateLineups() {
    this.props.generateLineups();
  }

  render() {
    let lineup = this.props.lineups.map((lineup, index) => {
      return <Lineup key={'lineup_' + index} {...lineup} />
    });

    return (
      <div className="Lineups-container">
        <Toolbar>
          <ToolbarGroup key={0} float="left">
            <ToolbarTitle text="Lineups" />
          </ToolbarGroup>
          <ToolbarGroup key={1} float="right">
            <RaisedButton disabled={this.props.loading ? true : false} label="Generate Lineups" primary={true} onClick={this._generateLineups} />
          </ToolbarGroup>
        </Toolbar>
        <ul>
          {lineup}
        </ul>
      </div>
    );
  }

};