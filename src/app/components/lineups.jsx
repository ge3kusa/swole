import React from 'react';
import Lineup from './lineup';
import './../stylesheets/lineups.scss';
import FontIcon from 'material-ui/lib/font-icon';

export default class Lineups extends React.Component {

  constructor(props) {
    super();
  }

  render() {
    let lineup = this.props.lineups.map((lineup, index) => {
      return <Lineup key={'lineup_' + index} {...lineup} index={index} />
    });

    return (
      <div className="Lineups-container">
        <div className="toolbar">
          <button className="primary" disabled={this.props.loading ? true : false} onClick={this.props.generateLineups}>Generate Lineups</button>
        </div>
        <ul>
          {lineup}
        </ul>
      </div>
    );
  }

};