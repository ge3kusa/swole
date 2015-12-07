import React from 'react';
import _ from 'lodash';
// import Player from './player';
import './../stylesheets/players.scss';

import mui from 'material-ui';
const Table = mui.Table,
      TableBody = mui.TableBody,
      TableRowColumn = mui.TableRowColumn,
      TableRow = mui.TableRow,
      TableHeader = mui.TableHeader,
      TableHeaderColumn = mui.TableHeaderColumn,
      Toolbar = mui.Toolbar,
      ToolbarGroup = mui.ToolbarGroup,
      ToolbarSeparator = mui.ToolbarSeparator,
      DropDownMenu = mui.DropDownMenu,
      TextField = mui.TextField,
      ToolbarTitle = mui.ToolbarTitle,
      FontIcon = mui.FontIcon,
      FlatButton = mui.FlatButton,
      RaisedButton = mui.RaisedButton;

export default class Players extends React.Component {

  constructor(props) {
    super();

    let selected_position_index = 0;

    this._refreshPlayerList = this._refreshPlayerList.bind(this);
    this._filterPosition = this._filterPosition.bind(this);
    this._playerSelected = this._playerSelected.bind(this);
    this._lockPlayers = this._lockPlayers.bind(this);
    this._fadePlayers = this._fadePlayers.bind(this);
    this._clearPlayers = this._clearPlayers.bind(this);
    this._allSelected = this._allSelected.bind(this);

    this.state = {
      show_group_actions: false,
      q: "",
      selected_position_index: localStorage.getItem("selected_position_index") === null ? 0 : parseInt(localStorage.getItem("selected_position_index"), 10),
    };

  }

  _allSelected(checked) {
    console.log(checked);
  }

  _lockPlayers() {
    let self = this;

    if (self.refs.players_body.state.selectedRows === "all") {
      self.props.players.forEach((player, index) => {
        self.props.handleFadeLock({fade_or_lock: 'lock', filtered_index: index, identifier: self.props.players[index].identifier});
      });
    } else {
      self.refs.players_body.state.selectedRows.forEach((index) => {
        self.props.handleFadeLock({fade_or_lock: 'lock', filtered_index: index, identifier: self.props.players[index].identifier});
      });
    }

    this.setState({show_group_actions: false}, () => {
      self.refs.players_body.setState({selectedRows: []});
    });
  }

  _fadePlayers() {
    let self = this;

    if (self.refs.players_body.state.selectedRows === "all") {
      self.props.players.forEach((player, index) => {
        self.props.handleFadeLock({fade_or_lock: 'fade', filtered_index: index, identifier: self.props.players[index].identifier});
      });
    } else {
      self.refs.players_body.state.selectedRows.forEach((index) => {
        self.props.handleFadeLock({fade_or_lock: 'fade', filtered_index: index, identifier: self.props.players[index].identifier});
      });
    }

    this.setState({show_group_actions: false}, () => {
      self.refs.players_body.setState({selectedRows: []});
    });
  }

  _clearPlayers() {
    let self = this;

    if (self.refs.players_body.state.selectedRows === "all") {
      self.props.players.forEach((player, index) => {
        self.props.handleFadeLock({fade_or_lock: '', filtered_index: index, identifier: player.identifier});
      });
    } else {
      self.refs.players_body.state.selectedRows.forEach((index) => {
        self.props.handleFadeLock({fade_or_lock: '', filtered_index: index, identifier: self.props.players[index].identifier});
      });
    }

    this.setState({show_group_actions: false}, () => {
      self.refs.players_body.setState({selectedRows: []});
    });
  }

  _playerSelected(selectedRows) {
    let self = this;

    if (selectedRows.length === 0) this.setState({show_group_actions: false});
    if (selectedRows.length > 0) {
      this.setState({show_group_actions: true}, () => {
        self.refs.players_body.setState({selectedRows: selectedRows});
      });
    }
  }

  _filterPosition(e, index, item) {
    let self = this;

    localStorage.setItem("selected_position_index", index);

    this.setState({selected_position_index: index}, () => {
      self.props.updatePlayerFilter(index);
    });
  }

  _refreshPlayerList() {
    this.props.refreshPlayerList();
  }

  render() {
    let self = this,
        toolbar_group,
        players = this.props.players.map((player, index) => {
          let className = "",
              projection_sources = [];

          if (player.fade_or_lock === "fade") className += " fade";
          if (player.fade_or_lock === "lock") className += " lock";

          _.forEach(player.projection_sources, (proj, src) => {
            projection_sources.push(src + ": " + proj);
          });

          projection_sources = projection_sources.join(", ");

          return (
            <TableRow
              key={'player_' + index}
              className={className}>
              <TableRowColumn style={{textAlign: 'left'}}>
                {player.name}
                { player.home &&
                  <FontIcon title="Player is playing at home" className="material-icons home" style={{fontSize: '92%', marginLeft: '5px'}} />
                }
                { player.spread > 0 &&
                  <FontIcon title={"Player's team is an underdog (+" + player.spread + ")."} className="material-icons pets" style={{fontSize: '92%', marginLeft: '5px'}} />
                }
              </TableRowColumn>
              <TableRowColumn style={{textAlign: 'right', width: '40px'}}>${player.salary}</TableRowColumn>
              <TableRowColumn style={{textAlign: 'left', width: '40px'}}>{player.team}</TableRowColumn>
              <TableRowColumn style={{textAlign: 'left', width: '40px'}}>{player.opponent}</TableRowColumn>
              <TableRowColumn title={projection_sources} style={{textAlign: 'right', width: '40px'}}>{player.projection}</TableRowColumn>
            </TableRow>
          );
        });

    if (this.state.show_group_actions) {
      toolbar_group = (
        <ToolbarGroup key={1} float="right">
          <ToolbarTitle text={(self.refs.players_body.state.selectedRows === "all" ? self.props.players.length : self.refs.players_body.state.selectedRows.length) + ' selected'} style={{color: 'blue', fontSize: '95%'}} />
          <FontIcon title="Lock selected players" onClick={self._lockPlayers} className="material-icons lock_outline" />
          <FontIcon title="Fade selected players" onClick={self._fadePlayers} className="material-icons not_interested" />
          <FontIcon title="Reset selected fades and locks" onClick={self._clearPlayers} className="material-icons clear_all" />
        </ToolbarGroup>
      );
    } else {
      toolbar_group = (
        <ToolbarGroup key={1} float="left">
          <DropDownMenu
            ref="position_filter"
            selectedIndex={self.state.selected_position_index}
            menuItems={self.props.filter_positions}
            onChange={self._filterPosition} />
          <TextField
            hintText="Search..." />
          <RaisedButton style={{float: 'right'}} disabled={self.props.loading ? true : false} label="Reload Players" secondary={true} onClick={self._refreshPlayerList} />
        </ToolbarGroup>
      );
    }

    return (
      <div className="Players-container">
        <Toolbar>
          <ToolbarGroup key={0} float="left">
            <ToolbarTitle text="Players" />
          </ToolbarGroup>
          {toolbar_group}
        </Toolbar>
        <Table
          height="700px"
          multiSelectable={true}
          onRowSelection={self._playerSelected}
          style={{width: '710px'}}
          fixedHeader={true}
          fixedFooter={false}>
          <TableHeader
            adjustForCheckbox={true}
            displaySelectAll={true}
            allRowsSelected={this._allSelected}
            enableSelectAll={true}>
            <TableRow
              selectable={false}
              displayRowCheckbox={false}>
              <TableHeaderColumn style={{textAlign: 'left'}}>Name</TableHeaderColumn>
              <TableHeaderColumn style={{textAlign: 'right', width: '40px'}}>Salary</TableHeaderColumn>
              <TableHeaderColumn style={{textAlign: 'left', width: '40px'}}>Team</TableHeaderColumn>
              <TableHeaderColumn style={{textAlign: 'left', width: '40px'}}>Opponent</TableHeaderColumn>
              <TableHeaderColumn style={{textAlign: 'right', width: '40px'}}>Aggregate</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            ref="players_body"
            preScanRows={false}
            deselectOnClickaway={false}
            showRowHover={true}
            stripedRows={false}>
            {players}
          </TableBody>
        </Table>
      </div>
    );
  }

};