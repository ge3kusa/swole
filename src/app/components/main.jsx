/** In this file, we create a React component which incorporates components provided by material-ui */

import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import './../stylesheets/main.scss';

export default class Main extends React.Component {

  constructor(props) {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="Main-container">
        <div className="top">
          <div className="header">
            <img src="logo.png" height="20" />
            {/*<FontIcon className="material-icons menu" />*/}
          </div>
          <div className="filters">
            <input type="search" placeholder="Search ..." />
            <select>
              <option value="123">6:00pm (3 Games)</option>
            </select>
            <FontIcon className="material-icons filter_list" />
          </div>
        </div>
        <div className="middle">
          {/* <Players /> */}
        </div>
      </div>
    );
  }

};

Main.defaultProps = {};