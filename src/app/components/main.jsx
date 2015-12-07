import React from 'react';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import LightRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import Colors from 'material-ui/lib/styles/colors';
import mui from 'material-ui';
import request from 'superagent';
import Players from './players';
import Lineups from './lineups';
import _ from 'lodash';

import './../stylesheets/main.scss';

const RefreshIndicator = mui.RefreshIndicator,
      Dialog = mui.Dialog;

export default class Main extends React.Component {

  constructor(props) {
    super();

    this._refreshPlayerList = this._refreshPlayerList.bind(this);
    this._handleFadeLock = this._handleFadeLock.bind(this);
    this._generateLineups = this._generateLineups.bind(this);
    this._updatePlayerFilter = this._updatePlayerFilter.bind(this);

    this.filtered_players_cache = {};
    this.players = [];

    this.state = {
      filtered_players: [],
      lineups: [],
      loading: false,
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
    };
  }

  _handleFadeLock(data) {
    let self = this,
        main_index = self.filtered_players_cache[data.identifier],
        players = self.state.filtered_players;

    players[data.filtered_index].fade_or_lock = data.fade_or_lock;

    self.players[main_index].fade_or_lock = data.fade_or_lock;
    localStorage.setItem('players', JSON.stringify(self.players));
    localStorage.setItem('players_updated_at', new Date());
    self.setState({filtered_players: players})
  }

  _updatePlayerFilter(index) {
    let filtered_players = [];
    this.setState({filtered_players: this._filterPlayers(this.players)});
  }

  _generateLineups() {
    let self = this,
        players = [];

    self.players.forEach(player => {
      if (player.projection > 6 || player.fade_or_lock === "lock") {
        players.push({
          fade_or_lock: player.fade_or_lock,
          name: player.name,
          salary: player.salary,
          position: player.position,
          projection: player.projection,
        });
      }
    });

    self.refs.dialog.setState({open: true}, () => {
      self.setState({loading: true}, () => {
        request.post(self.props.api + "generate")
          .send({players: players})
          .end((err, res) => {
            // if (err) self.setState({flash_messages: 'An error occurred during lineup generation'})
            if (res.ok) {
              self.setState({loading: false, lineups: res.body}, () => {
                self.refs.dialog.setState({open: false});
                localStorage.setItem('lineups', JSON.stringify(res.body));
                localStorage.setItem('lineups_updated_at', new Date());
              });
            }
          })
      });
    });
  }

  _refreshPlayerList() {
    let self = this,
        filtered_players = [];

    self.refs.dialog.setState({open: true}, () => {
      self.setState({loading: true}, () => {
        request.get(self.props.api + "players", (err, res) => {
          if (res.ok) {
            filtered_players = self._filterPlayers(res.body.players)
            self.setState({loading: false, players: res.body.players, filtered_players: filtered_players}, () => {
              self.refs.dialog.setState({open: false});
              localStorage.setItem('players', JSON.stringify(res.body.players));
              localStorage.setItem('players_updated_at', new Date());
            });
          }
        });
      });
    });
  }

  _filterPlayers(players) {
    let self = this,
        selected_position = (localStorage.getItem("selected_position_index") === null) ? (this.props.filter_positions[this.refs.players.refs.position_filter.state.selectedIndex]).payload : (this.props.filter_positions[localStorage.getItem("selected_position_index")]).payload,
        filtered_players = [];

    self.players = players;

    players.forEach((player, index) => {
      if (player.position === selected_position) {
        filtered_players.push(player);
        self.filtered_players_cache[player.identifier] = index;
      }
    });

    return filtered_players;
  }

  componentDidMount() {
    let now = new Date(),
        self = this,
        state = {},
        players_updated_at = localStorage.getItem('players_updated_at') || 1,
        lineups_updated_at = localStorage.getItem('lineups_updated_at') || 1;

    players_updated_at = new Date(players_updated_at);
    lineups_updated_at = new Date(lineups_updated_at);

    if (Math.floor((now - players_updated_at) / (1000*60*60*24)) !== 0) {
      self._refreshPlayerList();
    } else {
      self.players = JSON.parse(localStorage.getItem("players")) || [];
      state.filtered_players = self._filterPlayers(self.players);
      if (Math.floor((now - lineups_updated_at) / (1000*60*60*24)) === 0) {
        if (localStorage.getItem("lineups") !== null) state.lineups = JSON.parse(localStorage.getItem("lineups"));
      }
      self.setState(state);
    }
  }

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  }

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.deepOrange500,
    });

    this.setState({muiTheme: newMuiTheme});
  }

  render() {

    let self = this;

    return (
      <div className="Main-container">
        <Dialog
          ref="dialog"
          modal={true}
          actions={[]}
          title="Loading please wait"
          autoDetectWindowHeight={true}
          open={self.state.loading}>
          <RefreshIndicator left={250} top={20} status={self.state.loading ? "loading" : "hide"} />
        </Dialog>
        <div className="columns">
          <Players ref="players" filter_positions={this.props.filter_positions} updatePlayerFilter={this._updatePlayerFilter} refreshPlayerList={this._refreshPlayerList} handleFadeLock={this._handleFadeLock} loading={this.state.loading} players={this.state.filtered_players} />
          <Lineups ref="lineups" generateLineups={this._generateLineups} loading={this.state.loading} lineups={this.state.lineups} />
        </div>
      </div>
    );
  }

};

Main.childContextTypes = {
  muiTheme: React.PropTypes.object,
};

Main.defaultProps = {
  api: "http://localhost:8081/",
  filter_positions: [{ payload: 'QB', text: 'QB'}, { payload: 'RB', text: 'RB'}, { payload: 'WR', text: 'WR'}, { payload: 'TE', text: 'TE'}, { payload: 'D', text: 'D'}],
};