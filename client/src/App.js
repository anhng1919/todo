import React from 'react';
import './App.css';
import {createBrowserHistory as createHistory} from 'history';
import {Router, Route} from 'react-router';
import {Navigator} from 'react-animated-navigator';
import {GraphQLProvider} from "./components/GraphQLProvider";
import {Home} from './pages/Home';
import {NewTask} from './pages/NewTask';
import {TaskDetail} from './pages/TaskDetail';

const historyObject = createHistory()

const isSecure = window.location.protocol === 'https:'
const graphqlHost = window.location.hostname
const graphqlPort = (process.env.NODE_ENV === 'development') ? 8088 : window.location.port



function App() {
  return (
    <Router history={historyObject}>
      <GraphQLProvider
        graphqlEndpoint={`${isSecure ? 'https' : 'http'}://${graphqlHost}:${graphqlPort}/graphql`}
        graphqlSubscriptionEndpoint={`${isSecure ? 'wss' : 'ws'}://${graphqlHost}:${graphqlPort}/graphql`}
      >

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
            path="/:id"
            component={TaskDetail}
          />


          <Route
            exact
            path="/"
            component={Home}
          />
        </Navigator>
      </GraphQLProvider>
    </Router>
  );
}

export default App;
