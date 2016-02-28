import React from 'react';
import Player from './player';
import Paper from 'material-ui/lib/paper';
import './../stylesheets/players.scss';

export default class Players extends React.Component {

  constructor(props) {
    super();
    this.state = {
      players: [],
    };
  }

  componentDidMount() {
    let players = [],
        player_keys = Object.keys(this.props.players);
    player_keys.forEach(key => {
      let player = this.props.players[key];
      player.meets_filter_criteria = true;
      player.meets_position_criteria = false;
      player.meets_search_criteria = true;
      if ((this.props.positions.indexOf(player.position) > -1)) player.meets_position_criteria = true;
      players.push(player);
    });
    // players = players.map(player => {return Immutable.fromJS(player);});
    this.setState({players});
  }

  render() {
    let self = this,
        players = self.state.players.map(player => {
          if (player.meets_filter_criteria && player.meets_position_criteria) {
            return (
              <Paper key={'player_' + player.identifier} className="player_chip" zDepth={1} transitionEnabled={false} rounded={false}>
                <Player player={player} />
              </Paper>
            );
          }
        });
    return (
      <div className="Players-container">
        {players}
      </div>
    );
  }

};