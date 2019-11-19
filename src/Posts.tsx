import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


const Posts: React.FC = () => {
  const columnDefs = [{
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const [rowData, setRowData] = useState<Array<any>>([]);

  useEffect(() => {
    axios.get("https://jsonplaceholder.typicode.com/posts")
      .then(({ data: postData }) => {
        let posts: Array<any> = postData;
        let userIds: Array<number> = posts.map((post: { userId: number }) => post.userId);
        userIds = userIds.filter((userId, index, self) => self.indexOf(userId) === index);
        let users: Array<any> = [];

        let fetchFunc = async (userId: number) => {
          let { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
          users.push(data);
        };

        let promises = userIds.map(userId => fetchFunc(userId));
        
        Promise.all(promises).then(() => {
          posts.forEach(post => post.username = users.find(user => user.id === post.userId).name);
          setRowData(posts);
         });

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
      >
      </AgGridReact>
    </div>
  );
};

export default Posts;