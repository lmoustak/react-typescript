import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  useLocation
} from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ReactMarkdown from 'react-markdown';

import './App.css';
import './styles.css'
import Counter from './Counter';
import FetchUsers from './FetchUsers';
import Posts from './Posts';

const App: React.FC = () => (
  <Router basename="/react-typescript">
    <Switch>
      <Route path="*">
        <AnimatedPages />
      </Route>
    </Switch>
  </Router>
);

const AnimatedPages: React.FC = () => {
  const location = useLocation();

  const markdown =
    `# Welcome to the ReactJS playground
### Select one of the top links to begin`;

  const startScreen = (
    <div className="row mt-5">
      <div className="col-12">
        <ReactMarkdown source={markdown} />
      </div>
    </div>
  );

  return (
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
          <li className="nav-item">
            <NavLink className="nav-link" to="/posts">Posts</NavLink>
          </li>
        </ul>
      </nav>

      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <div className="container text-center">
        <TransitionGroup>
          <CSSTransition key={location.key}
            classNames="page"
            timeout={300}
          >
            <Switch location={location}>
              <Route exact path="/">
                <div className="page">
                  {startScreen}
                </div>
              </Route>
              <Route path="/counter">
                <div className="page">
                  <Counter />
                </div>
              </Route>
              <Route path="/users">
                <div className="page">
                  <FetchUsers />
                </div>
              </Route>
              <Route path="/posts">
                <div className="page">
                  <Posts />
                </div>
              </Route>
            </Switch>

          </CSSTransition>
        </TransitionGroup>
      </div>

    </div>
  );

};

export default App;
