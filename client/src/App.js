import React from 'react';
import './App.css';
import {createBrowserHistory as createHistory} from 'history';
import {Router, Route} from 'react-router';
import {Navigator} from 'react-animated-navigator';

import {Home} from './pages/Home';
import {NewTask} from './pages/NewTask';

const historyObject = createHistory()

function App() {
  return (
    <Router history={historyObject}>
      <Navigator
        defaultDuration={400}
      >
        <Route
          exact
          path="/new"
          component={NewTask}
        />

        <Route
          exact
          path="/"
          component={Home}
        />
      </Navigator>
    </Router>
  );
}

export default App;
