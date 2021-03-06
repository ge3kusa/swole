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
    this.q = '';
    this.slate = '';
    this.filtered_players_cache = {};
    this._refreshPlayerList = this._refreshPlayerList.bind(this);
    this._updatePlayerFilter = this._updatePlayerFilter.bind(this);
    this._handleFadeLock = this._handleFadeLock.bind(this);
    this._generateLineups = this._generateLineups.bind(this);
    this._sortPlayers = this._sortPlayers.bind(this);
    this._fetchPlayers = this._fetchPlayers.bind(this);
    this._searchPlayers = this._searchPlayers.bind(this);
    this._doSort = this._doSort.bind(this);
    this._filterPlayersBySlate = this._filterPlayersBySlate.bind(this);

    this.state = {
      loading: false,
      sport: localStorage.getItem('sport') || 'nba',
      // sport: 'nba',
      lineups: [],
      slates: [],
      sort_order: 'desc',
      sort_attr: 'projection',
      filtered_players: [],
    };
  }

  componentDidMount() {
    this._fetchPlayers();
  }

  _searchPlayers(q) {
    let self = this;
    self.q = q;
    self.setState({filtered_players: self._filterPlayers(self.players)});
  }

  _sortPlayers(sort_attr, sort_order) {
    let self = this;
    this.setState({sort_order, sort_attr}, function() {
      self.setState({filtered_players: self._filterPlayers(self.players)});
    })
  }

  _doSort(filtered_players) {
    return _.sortByOrder(filtered_players, [this.state.sort_attr], [this.state.sort_order]);
  }

  _filterPlayersBySlate(slate) {
    let self = this;
    self.slate = slate;
    self.setState({filtered_players: self._filterPlayers(self.players)});
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
      state.slates = JSON.parse(localStorage.getItem(self.state.sport + "_slates")) || [];
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
      self._fetchPlayers();
    });
  }

  _generateLineups() {
    let self = this,
        players = [];

    self.players.forEach(player => {
      // if (player.fade_or_lock !== "fade" && (((player.per + player.minutes) >= 49.2)) || player.fade_or_lock === "lock") {
      // if (player.fade_or_lock !== "fade" && (((player.usage + player.minutes) >= 55.2)) || player.fade_or_lock === "lock") {
      // if (player.fade_or_lock !== "fade" && (((player.usage + player.minutes + player.per) >= 65.85)) || player.fade_or_lock === "lock") {
      if (player.fade_or_lock !== "fade") {
        players.push({
          fade_or_lock: player.fade_or_lock,
          name: player.name,
          team: player.team,
          minutes: player.minutes,
          opponent: player.opponent,
          salary: player.salary,
          position: player.position,
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

  _updatePlayerData(players) {
    let self = this;

    if (_.find(self.state.slates, {'event_id': players[0].event_id}) !== undefined) {
      players.forEach(new_player => {
        let old_player = _.find(self.players, {'identifier': new_player.identifier});
        if (old_player !== undefined && old_player.fade_or_lock.length > 0) new_player.fade_or_lock = old_player.fade_or_lock;
      });
    }

    return players;
  }

  _refreshPlayerList() {
    let self = this,
        x = 1,
        filtered_players = [];

    self.refs.dialog.setState({open: true});
    self.setState({loading: true});
    request.get(self.props.api + self.state.sport + "/players", (err, res) => {
      if (res.ok) {
        self.players = self._updatePlayerData(res.body.players);
        self.setState({loading: false, slates: res.body.slates, filtered_players: self._filterPlayers(self.players)});
        self.refs.dialog.setState({open: false});
        localStorage.setItem(self.state.sport + '_players', JSON.stringify(res.body.players));
        localStorage.setItem(self.state.sport + '_slates', JSON.stringify(res.body.slates));
        localStorage.setItem(self.state.sport + '_players_updated_at', new Date());
      }
    });
  }

  _filterPlayers(players) {
    let self = this;
    let selected_position = ((localStorage.getItem(self.state.sport + "_selected_position_index") || 0) === null) ? (this.props.filter_positions[this.state.sport][this.refs.players.refs.position_filter.state.selectedIndex]).payload : (this.props.filter_positions[this.state.sport][(localStorage.getItem(self.state.sport + "_selected_position_index") || 0 )]).payload,
        filtered_players = [];

    self.players.forEach((player, index) => {
      let name, matchup, q = (self.q).toLowerCase(), slate = self.slate;

      if (player.position.indexOf(selected_position) > -1 || selected_position === 'all') {
        if (q.length > 0 || slate.length > 0) {
          name = (player.name).toLowerCase();
          matchup = ((player.matchup).toLowerCase()).replace(/\(\S*\)\s/, "");
          if ((name.indexOf(q) > -1 || matchup.indexOf(q) > - 1) && ((player.event_id + '') === slate || slate === "")) filtered_players.push(player);
        } else {
          filtered_players.push(player);
        }
        self.filtered_players_cache[player.identifier] = index;
      }
    });

    return self._doSort(filtered_players);
  }

  render() {
    let self = this,
        nflClassNames = "sport-tab",
        nbaClassNames = "sport-tab";

    if (self.state.sport === "nba") nbaClassNames += " active";
    if (self.state.sport === "nfl") nflClassNames += " active";

    return (
      <div className="Main-container">
        <img src="logo.png" height="30" style={{padding: '10px'}} />
        <Dialog
          ref="dialog"
          actions={[]}
          title="Loading please wait"
        autoDetectWindowHeight={true}
          open={self.state.loading}>
          <RefreshIndicator left={250} top={20} status={self.state.loading ? "loading" : "hide"} />
        </Dialog>
        <div className="sports">
          <button onClick={self._changeSport.bind(self, 'nfl')} className={nflClassNames}>NFL</button>
          <button onClick={self._changeSport.bind(self, 'nba')} className={nbaClassNames}>NBA</button>
        </div>
        <div className="columns">
          <Players ref="players" sort_attr={self.state.sort_attr} filterPlayersBySlate={self._filterPlayersBySlate} sortPlayers={self._sortPlayers} searchPlayers={self._searchPlayers} sport={self.state.sport} handleFadeLock={this._handleFadeLock} updatePlayerFilter={this._updatePlayerFilter} refreshPlayerList={this._refreshPlayerList} filter_positions={this.props.filter_positions[this.state.sport]} loading={this.state.loading} players={this.state.filtered_players} slates={this.state.slates} />
          <Lineups generateLineups={this._generateLineups} loading={this.state.loading} lineups={this.state.lineups} />
        </div>
      </div>
    );
  }

};

Main.defaultProps = {
  api: window.hasOwnProperty('ENVIRONMENT') && window.ENVIRONMENT === "development" ? "http://localhost:8083/" : "http://picktaco.com:8083/",
  filter_positions: {nba: [{ payload: 'PG', text: 'PG'}, { payload: 'SG', text: 'SG'}, { payload: 'SF', text: 'SF'}, { payload: 'PF', text: 'PF'}, { payload: 'C', text: 'C'}, { payload: 'G', text: 'G'}, { payload: 'F', text: 'F'}, { payload: 'all', text: 'All'}], nfl: [{ payload: 'QB', text: 'QB'}, { payload: 'RB', text: 'RB'}, { payload: 'WR', text: 'WR'}, { payload: 'TE', text: 'TE'}, { payload: 'D', text: 'D'}, { payload: 'all', text: 'All'}]},
};