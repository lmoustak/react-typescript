import React, { useState, useEffect } from 'react';
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
import './styles.css';
import Counter from './Counter';
import FetchUsers from './FetchUsers';
import Posts from './Posts';
import { usePrevious } from "./hooks/usePrevious";

const App: React.FC = () => (
  <Router basename="/react-typescript">
    <AnimatedPages />
  </Router>
);

const AnimatedPages: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("");
  const previousPage = usePrevious(currentPage);
  const location = useLocation();

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  const navbarItems = [
    { title: "Home", linkTo: "/", exact: true },
    { title: "Counter", linkTo: "/counter" },
    { title: "Users", linkTo: "/users" },
    { title: "Posts", linkTo: "/posts" },
  ];
  const paths = navbarItems.map(item => item.linkTo);

  const transitions = useTransition(location, location => location.pathname, {
    from: newLocation => ({ opacity: 0, transform: `translate3d(${Math.sign(paths.indexOf(newLocation.pathname) - paths.indexOf(previousPage ?? "")) * 20}%, 0, 0)` }),
    enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    leave: prevLocation => ({ opacity: 0, transform: `translate3d(${Math.sign(paths.indexOf(prevLocation.pathname) - paths.indexOf(currentPage)) * 10}%, 0, 0)` }),
  });

  
  const navbarTrail = useTrail(navbarItems.length, {
    opacity: 1,
    transform: "translateX(0)",
    from: { opacity: 0, transform: "translateX(50px)" }
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
          {navbarTrail.map(
            (styles, index) => (
              <animated.div key={navbarItems[index].title} style={styles}>
                <Nav.Item>
                  <NavLink className="nav-link" to={navbarItems[index].linkTo} exact={navbarItems[index].exact}>{navbarItems[index].title}</NavLink>
                </Nav.Item>
              </animated.div>
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
              <Route path="*">
                <div className="page">
                <Row className="mt-5">
                  <Col xs>
                    <h1>404</h1>
                    <h4>Page not found</h4>
                  </Col>
                </Row>
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
