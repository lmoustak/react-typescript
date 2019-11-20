import React, { useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent } from '@ag-grid-community/all-modules';

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';

import { useSearch, SearchParams } from "./hooks/useSearch";


const Posts: React.FC = () => {
  const columnDefs = [{
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const [query, setQuery] = useState<string | SearchParams>("");
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