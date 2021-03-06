import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'

import Landing from './Landing';
import Game from './Game';

function App() {
  return (
    <Router>
      <div className='App'>
        <Switch>
          <Route exact path="/game" component={Game} />
          <Route exact path='/' component={Landing} />
          {/* Redirect to Landing page on invalid route, could be 404 in future */}
          <Redirect to='/' />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
