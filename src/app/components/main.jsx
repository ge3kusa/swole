/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import request from 'superagent';
import Players from './players';
import Lineups from './lineups';
import _ from 'lodash';

import './../stylesheets/main.scss';

import RefreshIndicator from 'material-ui/lib/refresh-indicator';
import Dialog from 'material-ui/lib/dialog';

export default class Main extends React.Component {

  constructor(props) {
    super();

    this.players = [];
    this.filtered_players_cache = {};
    this._refreshPlayerList = this._refreshPlayerList.bind(this);
    this._updatePlayerFilter = this._updatePlayerFilter.bind(this);
    this._handleFadeLock = this._handleFadeLock.bind(this);
    this._generateLineups = this._generateLineups.bind(this);
    this._fetchPlayers = this._fetchPlayers.bind(this);
    this._searchPlayers = this._searchPlayers.bind(this);

    this.state = {
      loading: false,
      q: '',
      sport: localStorage.getItem('sport') || 'nba',
      lineups: [],
      filtered_players: [],
    };
  }

  componentDidMount() {
    this._fetchPlayers();
  }

  _searchPlayers(q) {
    let self = this;
    this.setState({q: q}, () => {
      self.setState({filtered_players: self._filterPlayers(self.players)});
    });
  }

  _fetchPlayers() {
    let now = new Date(),
        self = this,
        state = {},
        players_updated_at = localStorage.getItem(self.state.sport + '_players_updated_at') || 1,
        lineups_updated_at = localStorage.getItem(self.state.sport + '_lineups_updated_at') || 1;

    players_updated_at = new Date(players_updated_at);
    lineups_updated_at = new Date(lineups_updated_at);

    if (Math.floor((now - players_updated_at) / (1000*60*60*24)) !== 0) {
      self._refreshPlayerList();
    } else {
      self.players = JSON.parse(localStorage.getItem(self.state.sport + "_players")) || [];
      state.filtered_players = self._filterPlayers(self.players);
      if (Math.floor((now - lineups_updated_at) / (1000*60*60*24)) === 0) {
        if (localStorage.getItem(self.state.sport + "_lineups") !== null) state.lineups = JSON.parse(localStorage.getItem(self.state.sport + "_lineups"));
      }
      self.setState(state);
    }
  }

  _changeSport(sport, e) {
    let self = this;
    this.setState({sport: sport}, () => {
      localStorage.setItem("sport", sport);
      self.refs.players._filterPosition.call(self.refs.players, null, 0);
      this._fetchPlayers();
    });
  }

  _generateLineups() {
    let self = this,
        players = [];

    self.players.forEach(player => {
      // if (player.fade_or_lock === "lock") console.log(player);
      if (player.fade_or_lock !== "fade") {
      // if (player.fade_or_lock !== "fade" && (player.per > 15 && player.usage_proj > 15 && player.min_proj >= 25) || player.fade_or_lock === "lock") {
      // if (player.fade_or_lock !== "fade" && ((player.per >= 15 && player.usage_proj >= 15 && player.min_proj >= 25) || player.fade_or_lock === "lock")) {
        players.push({
          fade_or_lock: player.fade_or_lock,
          name: player.name,
          team: player.team,
          opponent: player.opponent,
          salary: player.salary,
          position: player.position,
          // projection: player.ceiling_floor_std_dev, // alongwith a min in the solver?
          projection: player.projection,
        });
      }
    });

    self.refs.dialog.setState({open: true});
    self.setState({loading: true});
    request.post(self.props.api + self.state.sport + "/generate").send({players: players}).end((err, res) => {
      if (res.ok) {
        self.setState({loading: false, lineups: res.body});
        self.refs.dialog.setState({open: false});
        localStorage.setItem(self.state.sport + '_lineups', JSON.stringify(res.body));
        localStorage.setItem(self.state.sport + '_lineups_updated_at', new Date());
      }
    })
  }

  _handleFadeLock(data) {
    let main_index = this.filtered_players_cache[data.identifier],
        players = this.state.filtered_players;

    players[data.filtered_index].fade_or_lock = data.fade_or_lock;

    this.players[main_index].fade_or_lock = data.fade_or_lock;
    localStorage.setItem(this.state.sport + '_players', JSON.stringify(this.players));
    localStorage.setItem(this.state.sport + '_players_updated_at', new Date());
    this.setState({filtered_players: players})
  }

  _updatePlayerFilter(index) {
    let filtered_players = [];
    this.setState({filtered_players: this._filterPlayers(this.players)});
  }

  _refreshPlayerList() {
    let self = this,
        x = 1,
        filtered_players = [];

    self.refs.dialog.setState({open: true});
    self.setState({loading: true});
    request.get(self.props.api + self.state.sport + "/players", (err, res) => {
      if (res.ok) {
        self.players = res.body.players;
        self.setState({loading: false, filtered_players: self._filterPlayers(res.body.players)});
        self.refs.dialog.setState({open: false});
        localStorage.setItem(self.state.sport + '_players', JSON.stringify(res.body.players));
        localStorage.setItem(self.state.sport + '_players_updated_at', new Date());
      }
    });
  }

  _filterPlayers(players) {
    let self = this;
    let selected_position = (localStorage.getItem(self.state.sport + "_selected_position_index") === null) ? (this.props.filter_positions[this.state.sport][this.refs.players.refs.position_filter.state.selectedIndex]).payload : (this.props.filter_positions[this.state.sport][localStorage.getItem(self.state.sport + "_selected_position_index")]).payload,
        filtered_players = [];

    self.players.forEach((player, index) => {
      let name, matchup, q = (self.state.q).toLowerCase();
      if (player.position === selected_position) {
        if (q.length > 0) {
          name = (player.name).toLowerCase();
          matchup = (player.matchup).toLowerCase();
          if (name.indexOf(q) > -1 || matchup.indexOf(q) > - 1) filtered_players.push(player);
        } else {
          filtered_players.push(player);
        }
        self.filtered_players_cache[player.identifier] = index;
      }
    });

    return filtered_players;
  }

  render() {
    let self = this;

    return (
      <div className="Main-container">
        <Dialog
          ref="dialog"
          actions={[]}
          title="Loading please wait"
          autoDetectWindowHeight={true}
          open={self.state.loading}>
          <RefreshIndicator left={250} top={20} status={self.state.loading ? "loading" : "hide"} />
        </Dialog>
        <div className="columns">
          <Players ref="players" searchPlayers={self._searchPlayers} sport={self.state.sport} handleFadeLock={this._handleFadeLock} updatePlayerFilter={this._updatePlayerFilter} refreshPlayerList={this._refreshPlayerList} filter_positions={this.props.filter_positions[this.state.sport]} loading={this.state.loading} players={this.state.filtered_players} />
          <Lineups generateLineups={this._generateLineups} loading={this.state.loading} lineups={this.state.lineups} />
        </div>
      </div>
    );
  }

};

Main.defaultProps = {
  api: "http://localhost:8081/",
  filter_positions: {nba: [{ payload: 'PG', text: 'PG'}, { payload: 'SG', text: 'SG'}, { payload: 'SF', text: 'SF'}, { payload: 'PF', text: 'PF'}, { payload: 'C', text: 'C'}], nfl: [{ payload: 'QB', text: 'QB'}, { payload: 'RB', text: 'RB'}, { payload: 'WR', text: 'WR'}, { payload: 'TE', text: 'TE'}, { payload: 'D', text: 'D'}]},
};