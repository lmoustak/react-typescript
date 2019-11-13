import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  NavLink
} from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import './App.css';
import './styles.css'
import Counter from './Counter';
import FetchUsers from './FetchUsers';

const App: React.FC = () => {

  const startScreen = (
    <div className="row mt-5">
      <div className="col-12">
        <h1>Welcome to the ReactJS playground</h1>
        <h3>Select one of the top links to begin</h3>
      </div>
    </div>
  );

  return (
    <Router basename="/react-typescript">
      <div>
        <nav className="navbar navbar-expand-sm navbar-light bg-light">
          <div className="navbar-brand">React playground</div>
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" exact>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/counter">Counter</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/users">Users</NavLink>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="container text-center">
            <Route exact path="/counter">
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={300}
                  classNames="page"
                  unmountOnExit
                >
                  <div className="page">
                    <Counter />
                  </div>
                </CSSTransition>
              )}
            </Route>
            <Route exact path="/users">
            {({ match }) => (
              <CSSTransition
                in={match != null}
                timeout={300}
                classNames="page"
                unmountOnExit
              >
                <div className="page">
                  <FetchUsers />
                </div>
              </CSSTransition>
            )}
            </Route>
            <Route exact path="/">
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={300}
                  classNames="page"
                  unmountOnExit
                >
                  <div className="page">
                    {startScreen}
                  </div>
                </CSSTransition>
              )}
            </Route>
        </div>
        
      </div>
      {/* <div className="row" style={{padding: '10px'}}>
        <div className="col-md-12 col-lg-4">
          <Counter />
        </div>
        <div className="col-md-12 col-lg-8">
          <FetchUsers />
        </div>
      </div> */}
    </Router>
  );
}

export default App;
