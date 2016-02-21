import React from 'react';
import './../stylesheets/positions.scss';

export default class Positions extends React.Component {

  constructor(props) {
    super();
    this.state = {};
  }

  _togglePosition(position_idx, e) {
    e.preventDefault();
    this.props.togglePosition(position_idx);
  }

  render() {
    let self = this,
        positions_selected = [],
        positions = self.props.positions.map((position, idx) => {
          let selected = (self.props.selected_positions_indexes.indexOf(idx) > -1),
              position_props = {
                className: selected ? 'position active' : 'position',
                key: "position_" + idx,
              };
          if (selected) positions_selected.push(position);
          if ((positions_selected.length === self.props.positions.length) || (positions_selected.length === 0)) positions_selected = [];
          return (
            <li {...position_props}>
              <button onClick={self._togglePosition.bind(self, idx)}>{position}</button>
            </li>
          );
        });
    return (
      <div className="Positions-container">
        <div className="expanded">
          <ul>{positions}</ul>
        </div>
        <div className="compacted">
          {positions_selected.join(", ")}
        </div>
      </div>
    );
  }

};