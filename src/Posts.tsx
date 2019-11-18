import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


const Posts: React.FC = () => {
  const columnDefs = [{
    headerName: "User", colId: "username", sortable: true, filter: true,
    valueGetter: (params: any) => users.find(user => user.id === params.data.userId).name
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const [rowData, setRowData] = useState<Array<any>>([]);
  const [users, setUsers] = useState<Array<any>>([]);

  const frameworkComponents = {
    userRenderer: UserRenderer
  };

  useEffect(() => {
    axios.get("https://jsonplaceholder.typicode.com/posts")
      .then(async ({ data: postData }) => {
        setTimeout(() => {

          setRowData(postData);
        }, 0);

        for (let i = 0; i < postData.length; i++) {
          let postUserId = postData[i].userId;
          if (users.find(user => user.id === postUserId) == null) {
            let { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${postUserId}`);
            setUsers(prevUsers => [...prevUsers, data]);
          }
        }

      });

  }, []);

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: '500px',
        width: '100%'
      }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        modules={AllCommunityModules}
        frameworkComponents={frameworkComponents}
      >
      </AgGridReact>
    </div>
  );
}

const UserRenderer = (props: { value: string }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    axios.get(`https://jsonplaceholder.typicode.com/users/${props.value}`)
      .then(({ data }: { data: { username: string } }) => setUsername(data.username));
  });

  return username;
};

export default Posts;