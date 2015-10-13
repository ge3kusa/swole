import React from 'react/addons';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './components/main.jsx';
window.React = React;
injectTapEventPlugin();
React.render(<Main />, document.body);