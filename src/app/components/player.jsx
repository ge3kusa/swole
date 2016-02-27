import React from 'react';
import Checkbox from 'material-ui/lib/checkbox';
import './../stylesheets/player.scss';

export default class Player extends React.Component {

  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    let self = this;
    return (
      <div className="Player-container">
        <div className="column">
          <div className="row">
            <Checkbox />
          </div>
        </div>
        <div className="column">
          <div className="row">
            <span>{self.props.player.position}</span>
            <span>{self.props.player.name}</span>
            <span>{self.props.player.salary}</span>
          </div>
          <div className="row">
            <span>{self.props.player.matchup}</span>
            <span>7:00 PM</span>
          </div>
        </div>
        <div className="column">
          <div className="row">
            <span>{self.props.player.projection}</span>
          </div>
        </div>
      </div>
    );
  }

};