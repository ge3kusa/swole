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
    let players = [];

    Object.keys(this.props.players).forEach(key => {
      let player = this.props.players[key];
      players.push(player);
    });
    // players = players.map(player => {return Immutable.fromJS(player);});
    this.setState({players});
  }

  render() {
    let self = this,
        search_string = (self.props.search_string.trim()).toLowerCase(),
        players = self.state.players.map(player => {
          player.meets_position_criteria = false;
          player.meets_filter_criteria = true;
          player.meets_search_criteria = false;
          if ((self.props.positions.indexOf(player.position) > -1)) player.meets_position_criteria = true;
          // if (self.props.positions.length === 0) player.meets_position_criteria = true;
          if (1===2) player.meets_search_criteria = true;
          if (search_string.length === 0) player.meets_search_criteria = true;
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