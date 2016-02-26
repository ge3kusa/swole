import React from 'react';
import Player from './player';
import Paper from 'material-ui/lib/paper';
import './../stylesheets/players.scss';

export default class Players extends React.Component {

  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    let self = this,
        players = self.props.players.map(player => {
          return (
            <Paper key={'player_' + player.identifier} className="player_chip" zDepth={1} transitionEnabled={false} rounded={false}>
              <Player player={player} />
            </Paper>
          );
        });
    return (
      <div className="Players-container">
        {players}
      </div>
    );
  }

};