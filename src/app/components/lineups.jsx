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
  }

  render() {
    let lineup = this.props.lineups.map((lineup, index) => {
      return <Lineup key={'lineup_' + index} {...lineup} index={index} />
    });

    return (
      <div className="Lineups-container">
        <Toolbar>
          <ToolbarGroup key={0} float="left">
            <RaisedButton disabled={this.props.loading ? true : false} label="Generate Lineups" primary={true} onClick={this.props.generateLineups} />
          </ToolbarGroup>
        </Toolbar>
        <ul>
          {lineup}
        </ul>
      </div>
    );
  }

};