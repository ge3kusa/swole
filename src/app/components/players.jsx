import React from 'react';
import './../stylesheets/players.scss';

import mui from 'material-ui';
const Checkbox = mui.Checkbox,
      Toolbar = mui.Toolbar,
      ToolbarGroup = mui.ToolbarGroup,
      ToolbarSeparator = mui.ToolbarSeparator,
      TextField = mui.TextField,
      FontIcon = mui.FontIcon,
      RaisedButton = mui.RaisedButton,
      DropDownMenu = mui.DropDownMenu,
      ToolbarTitle = mui.ToolbarTitle;

export default class Players extends React.Component {

  constructor(props) {
    super();
    this._allChecked = this._allChecked.bind(this);
    this._filterPosition = this._filterPosition.bind(this);
    this._checkPlayer = this._checkPlayer.bind(this);
    this._filterPlayers = this._filterPlayers.bind(this);

    this.state = {
      selectedPlayers: [],
      q: '',
      selected_position_index: localStorage.getItem(props.sport + "_selected_position_index") === null ? 0 : parseInt(localStorage.getItem(props.sport + "_selected_position_index"), 10),
    };
  }

  _fadeOrLockPlayers(action) {
    let self = this;

    if (this.state.selectedPlayers === "all") {
      this.props.players.forEach((player, index) => {
        self.props.handleFadeLock({fade_or_lock: action, filtered_index: index, identifier: self.props.players[index].identifier});
        self.refs['player_' + index].setChecked(false);
      });
    } else {
      this.state.selectedPlayers.forEach((index) => {
        self.props.handleFadeLock({fade_or_lock: action, filtered_index: index, identifier: self.props.players[index].identifier});
        self.refs['player_' + index].setChecked(false);
      });
    }

    self.refs.check_all.setChecked(false);
    this.setState({selectedPlayers: []});
  }

  _filterPlayers() {
    let q = this.refs.q.getValue();
    this.setState({q: q});
    this.props.searchPlayers(q);
  }

  _filterPosition(e, index) {
    localStorage.setItem(this.props.sport + "_selected_position_index", index);
    this.setState({selected_position_index: index});
    this.props.updatePlayerFilter(index);
  }

  _checkPlayer(e, checked) {
    let self = this,
        index = parseInt(e.target.value, 10),
        selectedPlayers = this.state.selectedPlayers;

    if (checked) {
      selectedPlayers.push(index);
    } else {
      selectedPlayers.splice(selectedPlayers.indexOf(index),1);
    }

    this.setState({selectedPlayers});
  }

  _checkPlayerName(index, e) {
    let checked = !this.refs['player_' + index].isChecked();
    this.refs['player_' + index].setChecked(checked);
    this._checkPlayer({target: {value: index}}, checked);
  }

  _allChecked(e, checked) {
    let self = this;

    this.setState({selectedPlayers: checked ? "all" : []});
    this.props.players.forEach((player, index) => {
      self.refs['player_' + index].setChecked(checked);
    });
  }

  render() {
    let self = this,
        projection_source_count,
        toolbar_group,
        players = this.props.players.map((player, index) => {
          let className = "",
              projection_sources = [];

          if (player.fade_or_lock === "fade") className += " fade";
          if (player.fade_or_lock === "lock") className += " lock";

          _.forEach(player.projection_sources, (proj, src) => {
            projection_sources.push(src + ": " + proj);
          });

          projection_source_count = projection_sources.length;
          projection_sources = projection_sources.join(", ");

          return (
            <tr key={'player_' + index} className={className}>
              <td><Checkbox value={index + ''} onCheck={self._checkPlayer} ref={'player_' + index} /></td>
              <td onClick={self._checkPlayerName.bind(self, index)} style={{cursor: 'pointer', textAlign: 'left'}}>
                {player.name}
                { player.home &&
                  <FontIcon title="Player is playing at home" className="material-icons home" style={{fontSize: '92%', marginLeft: '5px'}} />
                }
                { player.spread > 0 &&
                  <FontIcon title={"Player's team is an underdog (+" + player.spread + ")."} className="material-icons pets" style={{fontSize: '92%', marginLeft: '5px'}} />
                }
              </td>
              <td className="right">${player.salary}</td>
              <td className="matchup" title={player.total}>{player.matchup}</td>
              <td title={projection_sources} className="right">{player.projection} ({projection_source_count})</td>
              <td className="right">{player.standard_deviation}</td>
            </tr>
          );
        });

    if (this.state.selectedPlayers.length > 0) {
      toolbar_group = (
        <ToolbarGroup key={0} float="right">
          <ToolbarTitle text={(this.state.selectedPlayers === "all" ? self.props.players.length : this.state.selectedPlayers.length) + ' selected'} style={{color: 'blue', fontSize: '95%'}} />
          <FontIcon title="Lock selected players" onClick={self._fadeOrLockPlayers.bind(self, 'lock')} className="material-icons lock_outline" />
          <FontIcon title="Fade selected players" onClick={self._fadeOrLockPlayers.bind(self, 'fade')} className="material-icons not_interested" />
          <FontIcon title="Reset selected fades and locks" onClick={self._fadeOrLockPlayers.bind(self, '')} className="material-icons clear_all" />
        </ToolbarGroup>
      );
    } else {
      toolbar_group = (
        <ToolbarGroup key={0} float="left">
          <RaisedButton disabled={self.props.loading ? true : false} label="Reload Players" secondary={true} onClick={this.props.refreshPlayerList} />
          <DropDownMenu
            ref="position_filter"
            style={{width: '100px'}}
            selectedIndex={self.state.selected_position_index}
            menuItems={self.props.filter_positions}
            onChange={self._filterPosition} />
          <TextField ref="q" onChange={self._filterPlayers} defaultValue={this.state.q} style={{width: '350px', marginTop: '5px'}} hintText="Search..." />
        </ToolbarGroup>
      );
    }

    return (
      <div className="Players-container">
         <Toolbar>
          {toolbar_group}
        </Toolbar>
        <div className="table-header">
          <table>
            <thead>
              <tr>
                <th><Checkbox ref="check_all" value="all" onCheck={this._allChecked} /></th>
                <th>Name</th>
                <th className="right">Salary</th>
                <th className="matchup">Matchup</th>
                <th className="right"><span className="math-symbol">x&#772;</span></th>
                <th className="right"><span className="math-symbol">&#963;</span></th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="table-body">
          <table>
            <tbody>
              {players}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

};