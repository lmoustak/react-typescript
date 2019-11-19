import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


const Posts: React.FC = () => {
  const columnDefs = [{
    headerName: "User", colId: "username", sortable: true, filter: true,
    valueGetter: (params: any) => {
      let match = users.find(user => user.id === params.data.userId);

      if (match != null) {
        return match.name;
      } else {
        return params.data.userId;
      }
    }
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const [rowData, setRowData] = useState<Array<any>>([]);
  const [users, setUsers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const frameworkComponents = {
    userRenderer: UserRenderer
  };

  let gridApi: any;
  const onGridReady = (params: any) => {
    gridApi = params.api;
  };

  useEffect(() => {
    setLoading(true);
    axios.get("https://jsonplaceholder.typicode.com/posts")
      .then(({ data: postData }) => {
        setRowData(postData.slice(0, 10));
        let userIds: Array<number> = postData.map((post: { userId: number }) => post.userId);
        userIds = userIds.filter((userId, index, self) => self.indexOf(userId) === index);
        let promises = [];

        for (let i = 0; i < userIds.length; i++) {
          promises.push(async () => {
            let { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${userIds[i]}`);
            setUsers(prevUsers => [...prevUsers, data]);
          });
        }

        Promise.all(promises).then(() => { setLoading(false); gridApi.refreshCells(); });

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
      {!loading &&
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          modules={AllCommunityModules}
          frameworkComponents={frameworkComponents}
          onGridReady={onGridReady}
        >
        </AgGridReact>
      }
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