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
import { Row, Col, Navbar, Nav, Container } from "react-bootstrap";

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
    <Row className="mt-5">
      <Col xs>
        <ReactMarkdown source={markdown} />
      </Col>
    </Row>
  );

  return (
    <div>
      <Navbar bg="light" expand="sm">
        <Navbar.Brand>React playground</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Item>
            <NavLink className="nav-link" to="/" exact>Home</NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink className="nav-link" to="/counter">Counter</NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink className="nav-link" to="/users">Users</NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink className="nav-link" to="/posts">Posts</NavLink>
          </Nav.Item>
        </Nav>
      </Navbar>

      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Container className="text-center">
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
      </Container>

    </div>
  );

};

export default App;
