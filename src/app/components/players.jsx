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
            <Paper style={{margin: '10px', padding: '15px'}} zDepth={1} transitionEnabled={false} rounded={false}>
              <Player key={'player_' + player.identifier} player={player} />
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