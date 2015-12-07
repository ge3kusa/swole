import React from 'react';
import './../stylesheets/lineup.scss';

export default class Lineup extends React.Component {

  constructor(props) {
    super();
  }

  render() {

    let players = [];

    this.props.players.forEach(player => {
      players.push(player.name);
    });

    return (
      <li className="Lineup-container">
        <div>{players.join(", ")}</div>
        <div className="totals">
          <h4 className="projection">{this.props.projection}</h4>
          <h4 className="total">{this.props.total}</h4>
        </div>
      </li>
      );
  }

};