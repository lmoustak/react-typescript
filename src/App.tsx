import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  useLocation
} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Row, Col, Navbar, Nav, Container } from "react-bootstrap";
import { useTransition, animated } from "react-spring";

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
  const transitions = useTransition(location, location => location.pathname, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(1.2)' },
  });

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
        {transitions.map(({ item, props, key }) => (
          <animated.div key={key} style={props}>
            <Switch location={item}>
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
          </animated.div>
        ))}
      </Container>

    </div>
  );

};

export default App;
