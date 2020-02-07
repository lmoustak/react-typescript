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
import { useTrail, useTransition, animated } from "react-spring";

import './App.css';
import './styles.css'
import Counter from './Counter';
import FetchUsers from './FetchUsers';
import Posts from './Posts';

const App: React.FC = () => (
  <Router basename="/react-typescript">
    <AnimatedPages />
  </Router>
);

const AnimatedPages: React.FC = () => {
  const location = useLocation();
  const transitions = useTransition(location, location => location.pathname, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(1.2)' },
  });

  const navbarItems = [
    { title: "Home", linkTo: "/", exact: true },
    { title: "Counter", linkTo: "/counter" },
    { title: "Users", linkTo: "/users" },
    { title: "Posts", linkTo: "/posts" },
  ];
  const navbarTrail = useTrail(navbarItems.length, {
    opacity: 1,
    transform: "translateX(0)",
    from: { opacity: 0, transform: "translateX(50px)" }
  });
  const AnimatedNavItem = animated(Nav.Item);


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
          {navbarTrail.map(
            (styles, index) => (
              <AnimatedNavItem key={navbarItems[index].title} style={styles}>
                <NavLink className="nav-link" to={navbarItems[index].linkTo} exact={navbarItems[index].exact}>{navbarItems[index].title}</NavLink>
              </AnimatedNavItem>
            )
          )}
          {/* <Nav.Item>
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
          </Nav.Item> */}
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
