import React from 'react';
import './../stylesheets/players.scss';

import FontIcon from 'material-ui/lib/font-icon';
import Checkbox from 'material-ui/lib/checkbox';

export default class Players extends React.Component {

  constructor(props) {
    super();
    this.selected_position_index = localStorage.getItem(props.sport + "_selected_position_index") === null ? 0 : parseInt(localStorage.getItem(props.sport + "_selected_position_index"), 10);
    this.q = '';
    this.slate_filter = '';

    this._allChecked = this._allChecked.bind(this);
    this._filterPosition = this._filterPosition.bind(this);
    this._checkPlayer = this._checkPlayer.bind(this);
    this._filterPlayers = this._filterPlayers.bind(this);
    this._filterPlayersBySlate = this._filterPlayersBySlate.bind(this);
    this._clearFilter = this._clearFilter.bind(this);

    this.state = {
      selectedPlayers: [],
      players: [],
    };
  }

  _fadeOrLockPlayers(action) {
    let self = this;

    if (this.state.selectedPlayers === "all") {
      this.props.players.forEach((player, index) => {
        self.props.handleFadeLock({fade_or_lock: action, filtered_index: index, identifier: self.props.players[index].identifier});
      });
    } else {
      this.state.selectedPlayers.forEach((index) => {
        self.props.handleFadeLock({fade_or_lock: action, filtered_index: index, identifier: self.props.players[index].identifier});
      });
    }

    this.setState({selectedPlayers: []}, () => {
      self.refs.check_all.setState({switched: true});
      self.refs.check_all.setChecked(false);
      self.props.players.forEach((player, idx) => {
        self.refs['player_' + idx].setState({switched: false}, () => {
          self.refs['player_' + idx].setChecked(false);
        });
      });
    });
  }

  _clearFilter() {
    this.refs.q.value = '';
    this._filterPlayers();
  }

  _filterPlayers() {
    let q = this.refs.q.value;
    this.q = q;
    this.props.searchPlayers(q);
  }

  _filterPlayersBySlate(e) {
    this.setState({slate_filter: e.target.value});
    this.props.filterPlayersBySlate(e.target.value);
  }

  _filterPosition(e) {
    let index = e.target.selectedIndex
    localStorage.setItem(this.props.sport + "_selected_position_index", index);
    this.selected_position_index = index
    this.props.updatePlayerFilter();
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

    this.setState({selectedPlayers}, () => {
      self.refs['player_' + index].setState({switched: checked}, () => {
        self.refs['player_' + index].setChecked(checked);
      });
    });
  }

  _checkPlayerName(index, e) {
    let checked = !this.refs['player_' + index].isChecked();
    this.refs['player_' + index].setChecked(checked);
    this._checkPlayer({target: {value: index}}, checked);
  }

  _allChecked(e, checked) {
    let self = this;

    this.setState({selectedPlayers: checked ? "all" : []}, () => {
      self.refs.check_all.setState({switched: checked});
      self.refs.check_all.setChecked(checked);
      self.props.players.forEach((player, index) => {
        self.refs['player_' + index].setState({switched: checked}, () => {
          self.refs['player_' + index].setChecked(checked);
        });
      });
    });
  }

  _playerMatchupTeam(team, matchup) {
    let pos_match = matchup.indexOf(team),
        base_str;

    if (pos_match > 0) {
      base_str = matchup.slice(0,pos_match);
      return (<span>{base_str}<b>{team}</b></span>);
    }
    if (pos_match === 0) {
      base_str = matchup.slice(team.length);
      return (<span><b>{team}</b>{base_str}</span>);
    }
  }

  render() {
    let self = this,
        projection_source_count,
        toolbar_group,
        slatesOptions = self.props.slates.map((slate, idx) => {
          return <option key={'option_slate_' + idx} value={slate.spread_summary}>{slate.spread_summary.replace(/\(\S*\)\s/, "") + ' ' + slate.date_time_formatted}</option>
        }),
        positions = self.props.filter_positions.map((pos, idx) => {
          return <option key={'option_player_' + idx} value={pos.payload}>{pos.text}</option>
        }),
        filterClassNames = self.q.length > 0 ? "clear material-icons" : "material-icons",
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
              <td className="rows" onClick={self._checkPlayerName.bind(self, index)} style={{cursor: 'pointer', textAlign: 'left'}}>
                <div>
                  <span className="player-name">{player.name}</span>
                  { player.opponent === "DEN" && !player.home &&
                    <FontIcon title="Player is playing a road game in Denver's high altitude which may affect his performance" className="material-icons altitude" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                  { player.home &&
                    <FontIcon title="Player is playing at home" className="material-icons home" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                  { player.spread > 0 &&
                    <FontIcon title={"Player's team is an underdog (+" + player.spread + ")."} className="material-icons pets" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                </div>
                { this.props.sport === "nba" &&
                  <div>
                    <small>PER: {player.per}</small>
                    <small>Usg: {player.usage_proj} ({(player.usage_proj - player.usage).toFixed(2)})</small>
                  </div>
                }
              </td>
              <td className="right rows">
                <div>${player.salary}</div>
                <div>
                  <small>{player.month_salary_change}</small>
                </div>
              </td>
              <td className="matchup rows">
                <div style={{position: 'relative'}}>
                  {this._playerMatchupTeam(player.team, player.matchup)}
                  { this.props.sport === 'nfl' && !player.indoors && player.wind > 15 &&
                    <FontIcon title={player.wind + ' MPH'} className="material-icons wind" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                  { this.props.sport === 'nfl' && !player.indoors && player.temp < 32 &&
                    <FontIcon title={player.temp + ' degrees'} className="material-icons cold" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                  { this.props.sport === 'nfl' && !player.indoors && player.precip_prob > 40 &&
                    <FontIcon title={player.precip_prob + '%'} className="material-icons rain" style={{fontSize: '92%', marginLeft: '5px'}} />
                  }
                  { this.props.sport === 'nba' && player.rest === 1 &&
                    <label>B2B</label>
                  }
                </div>
                <div>
                  <small>{player.matchup_time}</small>
                  <small>Tot: {player.total}</small>
                  { this.props.sport === 'nba' &&
                    <small>Pace: {player.pace_d}</small>
                  }
                </div>
              </td>
              <td title={projection_sources} className="right rows">
                <div>{player.projection} ({(player.projection-((player.salary/1000)/.2199)).toFixed(2)})</div>
                <div>
                  <small>$/FP: {(player.salary/player.projection).toFixed(2)}</small>
                </div>
              </td>
            </tr>
          );
        });

    if (this.state.selectedPlayers.length > 0) {
      toolbar_group = (
        <div className="toolbar">
          <h4 className="action-selected-count">{(this.state.selectedPlayers === "all" ? self.props.players.length : this.state.selectedPlayers.length) + ' selected'}</h4>
          <div className="action-icons-group">
            <FontIcon title="Lock selected players" onClick={self._fadeOrLockPlayers.bind(self, 'lock')} className="material-icons lock_outline" />
            <FontIcon title="Fade selected players" onClick={self._fadeOrLockPlayers.bind(self, 'fade')} className="material-icons not_interested" />
            <FontIcon title="Reset selected fades and locks" onClick={self._fadeOrLockPlayers.bind(self, '')} className="material-icons clear_all" />
          </div>
        </div>
      );
    } else {
      toolbar_group = (
        <div className="toolbar">
          <input ref="q" onChange={self._filterPlayers} value={this.q} style={{width: '250px', marginTop: '0', marginLeft: '35px', float: 'right'}} placeholder="Search..." />
          <select ref="slate_filter" onChange={self._filterPlayersBySlate} value={self.state.slate_filter}>
            <option value="">All games</option>
            {slatesOptions}
          </select>
          <select style={{width: '55px', float: 'right'}} ref="position_filter" onChange={self._filterPosition} value={self.props.filter_positions[self.selected_position_index].payload}>
            {positions}
          </select>
          <button style={{float: 'left', marginRight: '20px'}} onClick={this.props.refreshPlayerList} disabled={self.props.loading ? true : false} className="primary">Update Players</button>
          <FontIcon title="Clear" onClick={self._clearFilter} className={filterClassNames} />
        </div>
      );
    }

    return (
      <div className="Players-container">
        <div>
          {toolbar_group}
        </div>
        <div className="table-header">
          <table>
            <thead>
              <tr>
                <th><Checkbox ref="check_all" value="all" onCheck={this._allChecked} /></th>
                <th>Name</th>
                <th className="right">Salary</th>
                <th className="matchup">Matchup</th>
                <th className="right">Aggregate</th>
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