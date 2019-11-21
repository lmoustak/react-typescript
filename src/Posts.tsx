import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent } from '@ag-grid-community/all-modules';
import Select from 'react-select';

import { useSearch, SearchParams } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


const Posts: React.FC = () => {
  const columnDefs: Array<{ [key: string]: string | boolean }> = [{
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const options = columnDefs.map(column => ({ value: column.field, label: column.headerName }));

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

  /* const handleSearchClick = () => setQuery({
    url: "https://jsonplaceholder.typicode.com/posts",
    joins: {
      select: "name",
      as: "username",
      from: "https://jsonplaceholder.typicode.com/users",
      join: "id",
      on: "userId"
    }
  }); */


  const gridApi = useRef<GridApi>();
  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  }

  const handleOnSelectChange = (inputValue: any, { action }: { action: string }) => {

    columnDefs.forEach(column => {
      column.hide = options.every(option => option.value !== column.field);
    });
  };

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
    <div>
      <Select
        options={options}
        defaultValue={options}
        isMulti
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        onChange={handleOnSelectChange}
      />
      <div
        className="ag-theme-balham"
        style={{
          height: '500px',
          width: '100%'
        }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={data}
          modules={AllCommunityModules}
          onGridReady={onGridReady}
        >
        </AgGridReact>
      </div>
    </div>

  );
};

export default Posts;