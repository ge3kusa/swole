import React from 'react';
import './../stylesheets/lineup.scss';

export default class Lineup extends React.Component {

  constructor(props) {
    super();
  }

  render() {

    let players = [];

    this.props.players.forEach(player => {
      let full_name = (player.name).split(" ");
      if (player.position === "D") players.push((full_name.length > 2 ? full_name[0] + " " + full_name[1] : full_name[0]) + " Def");
      if (player.position !== "D") players.push(full_name[0][0] + ". " + full_name[1]);
    });

    return (
      <li className="Lineup-container">
        <div>{players.join(", ")}</div>
        <div className="totals">
          <h4 className="projection">{this.props.index + 1})</h4>
          <h4 className="projection">{parseFloat(this.props.projection).toFixed(2)}</h4>
          <h4 className="total">{this.props.total}</h4>
          <div className="correlations">
            { this.props.qb_rec &&
              <small className="positive">QB+REC</small>
            }
            { this.props.wr_wr &&
              <small className="positive">WRvsWR</small>
            }
            { this.props.rb_d &&
              <small className="positive">RB+D</small>
            }
            { this.props.d_rec &&
              <small className="negative">DvsREC</small>
            }
            { this.props.d_qb &&
              <small className="negative">DvsQB</small>
            }
            { this.props.qb_d &&
              <small className="negative">QB+D</small>
            }
            { this.props.d_rb &&
              <small className="negative">DvsRB</small>
            }
            { this.props.rb_rb &&
              <small className="negative">RBvsRB</small>
            }
            { this.props.wr_rb &&
              <small className="negative">RB+WR</small>
            }
            { this.props.qb_rb &&
              <small className="negative">QB+RB</small>
            }
            { this.props.rec_rec_noqb &&
              <small className="negative">RECx2(QB)</small>
            }
          </div>
        </div>
      </li>
      );
  }

};