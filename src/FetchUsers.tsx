import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import User from './interfaces/User';
import { Table, InputGroup, FormControl, Button } from 'react-bootstrap';

interface UserProps {
  users: Array<User>
};

const FetchUsers: React.FC = () => {

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<User>>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  useEffect(() => {
    setLoading(true);

    axios.get("https://jsonplaceholder.typicode.com/users").then(response => {
      setUsers(response.data);
    }).catch(error => {
      if (error.response) {
        console.log("Data:", error.response.data);
        console.log("Status:", error.response.status);
        console.log("Headers:", error.response.headers);
      } else if (error.request) {
        console.log("Request:", error.request);
      } else {
        console.log("Error:", error.message);
      }

      console.log(error.config);
    }).finally(() => setLoading(false));
    
  }, []);

  /**
   * Filters users table
   * 
   * @param nameFilter - The users' `name` filter
   * @param usernameFilter - The users' `username` filter
   * @param emailFilter - The users' `email` filter
   * 
   * @returns The rows which pass all 3 filters
   */
  const filterUsers = (nameFilter: string, usernameFilter: string, emailFilter: string) => {

    return users.map((user: User) => {
      if (
        user.name.toLowerCase().includes(nameFilter.toLowerCase())
        && user.username.toLowerCase().includes(usernameFilter.toLowerCase())
        && user.email.toLowerCase().includes(emailFilter.toLowerCase())
        ) 
      {
        return (
          <tr key={user.id}>
            <th scope="row">{user.id}</th>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
          </tr>
        );

      } else {
        return null;
      }
    });
  };

  const handleUsersNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(event.target.value);
  };

  const handleUsersUsernameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameFilter(event.target.value);
  };

  const handleUsersEmailFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailFilter(event.target.value);
  };

  const handleUsersNameFilterClearClick = () => setNameFilter('');
  const handleUsersUsernameFilterClearClick = () => setUsernameFilter('');
  const handleUsersEmailFilterClearClick = () => setEmailFilter('');

  return (
    <div>
      {loading
        ? (<div className="text-center"><FontAwesomeIcon icon="spinner" pulse size="8x"/></div>)
        : (
          <Table striped>
            <thead>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">
                  <InputGroup>
                    <FormControl type="text" name="nameFilter" value={nameFilter} placeholder="Name" onChange={handleUsersNameFilterChange} />
                    <InputGroup.Append>
                      <Button variant="outline-secondary" onClick={handleUsersNameFilterClearClick}><FontAwesomeIcon icon="times" /></Button>
                    </InputGroup.Append>
                  </InputGroup>
                </th>
                <th scope="col">
                  <InputGroup>
                    <FormControl type="text" name="usernameFilter" value={usernameFilter} placeholder="Username" onChange={handleUsersUsernameFilterChange} />
                    <InputGroup.Append>
                      <Button variant="outline-secondary" onClick={handleUsersUsernameFilterClearClick}><FontAwesomeIcon icon="times" /></Button>
                    </InputGroup.Append>
                  </InputGroup>
                </th>
                <th scope="col">
                  <InputGroup>
                    <FormControl type="text" name="emailFilter" value={emailFilter} placeholder="Email" onChange={handleUsersEmailFilterChange} />
                    <InputGroup.Append>
                      <Button variant="outline-secondary" onClick={handleUsersEmailFilterClearClick}><FontAwesomeIcon icon="times" /></Button>
                    </InputGroup.Append>
                  </InputGroup>
                </th>
              </tr>
            </thead>
            <tbody>
              {filterUsers(nameFilter, usernameFilter, emailFilter)}
            </tbody>
          </Table>
          )
      }
    </div>
  );
}

export default FetchUsers;