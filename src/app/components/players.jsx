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
      player.visible = true;
      players.push(player);
    });
    // players = players.map(player => {return Immutable.fromJS(player);});
    this.setState({players});
  }

  render() {
    let self = this,
        players = self.state.players.map(player => {
          if (player.visible) {
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