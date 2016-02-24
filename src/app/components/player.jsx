import React from 'react';
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
        {self.props.player.name}
      </div>
    );
  }

};