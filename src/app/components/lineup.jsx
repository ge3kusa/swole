import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import './../stylesheets/lineup.scss';

export default class Lineup extends React.Component {

  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    let self = this,
        position_groupings = {},
        lineup = [];

    self.props.lineup.players.forEach(player => {
      let p = player.split("|"),
          position = p[0].trim(),
          name = p[2].trim();
      if (!position_groupings.hasOwnProperty(position)) position_groupings[position] = [];
      position_groupings[position].push(name);
    });

    lineup = self.props.positions.map((position, idx) => {
      let position_output = position_groupings[position.toLowerCase()].map(player => {
        return <span key={'player_' + player}>{player}</span>;
      });
      return (
        <div key={'position_' + position} >
          {position_output}
        </div>
      );
    });
    return (
      <div className="Lineup-container">
        {/*<FontIcon className="material-icons navigate_before">navigate_before</FontIcon>*/}
        <div className="players">{lineup}</div>
        {/*<FontIcon className="material-icons navigate_next">navigate_next</FontIcon>*/}
      </div>
    );
  }

};