import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent } from '@ag-grid-community/all-modules';

import { useSearch, SearchParams } from "./hooks/useSearch";

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

  const [query, setQuery] = useState<string | SearchParams>({
    url: "https://jsonplaceholder.typicode.com/posts",
    joins: {
      select: "name",
      as: "username",
      from: "https://jsonplaceholder.typicode.com/users",
      join: "id",
      on: "userId"
    }
  });
  const [data, loading] = useSearch(query);

  const handleSearchClick = () => setQuery({
    url: "https://jsonplaceholder.typicode.com/posts",
    joins: {
      select: "name",
      as: "username",
      from: "https://jsonplaceholder.typicode.com/users",
      join: "id",
      on: "userId"
    }
  });


  const gridApi = useRef<GridApi>();
  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  }

  useEffect(() => {
    if (gridApi.current) {
      if (loading) {
        gridApi.current.showLoadingOverlay();
      } else if (!data.length) {
        gridApi.current.showNoRowsOverlay();
      } else {
        gridApi.current.hideOverlay();
      }
    }
  });

  return (
    <div
      className="ag-theme-balham"
      style={{
        height: '500px',
        width: '100%'
      }}
    >
      <div className="dropdown pull-right">
        <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
          Show Columns
        </button>
        <div className="dropdown-menu">
          <a className="dropdown-item" href="#">Action</a>
          <a className="dropdown-item" href="#">Another action</a>
          <a className="dropdown-item" href="#">Something else here</a>
        </div>
      </div>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={data}
        modules={AllCommunityModules}
        onGridReady={onGridReady}
      >
      </AgGridReact>
    </div>
  );
};

export default Posts;