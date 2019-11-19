import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';

import {useSearch, DataParams} from "./hooks/useSearch";


const Posts: React.FC = () => {
  const columnDefs = [{
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const [rowData, setRowData] = useState<Array<any>>([]);
  const [id, setId] = useState("");
  const [query, setQuery] = useState<string | DataParams>("");

  const [data, loading] = useSearch(query);

  const fetchRows = () => {
    //setLoading(true);

    const url = "https://jsonplaceholder.typicode.com/posts" + (id ? `/${id}` : "");
    axios.get(url)
      .then(({ data: postData }) => {
        let posts: Array<any> = Array.isArray(postData) ? postData : [postData];
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
          //setLoading(false);
         });

      });

  };

  const handleIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    setId(isNaN(parseInt(newValue)) ? "" : newValue);
  };

  const handleSearchClick = () => setQuery({
    queryUrl: "https://jsonplaceholder.typicode.com/posts",
    transformations: {
      transformationUrl: "https://jsonplaceholder.typicode.com/users",
      fromField: "userId",
      toField: "username",
      queryResultField: "id"
    }
  });

  //useEffect(fetchRows, []);

  let gridApi: GridApi;
  const onGridReady = (params: GridReadyEvent) => {
    gridApi = params.api;
    loading ? gridApi.showLoadingOverlay() : gridApi.hideOverlay();
  }

  const loadingTemplate = '<span class="ag-overlay-loading-center">Please wait while your rows are loading...</span>';

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: '500px',
        width: '100%'
      }}
    >
      {/* <input type="text" value={id} onChange={handleIdChange} /> */}
      <button className="btn btn-primary" onClick={handleSearchClick}>Search</button>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={data}
        modules={AllCommunityModules}
        onGridReady={onGridReady}
        overlayLoadingTemplate={loadingTemplate}
      >
      </AgGridReact>
    </div>
  );
};

export default Posts;