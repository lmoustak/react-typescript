import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent } from '@ag-grid-community/all-modules';
import Select from 'react-select';

import { useSearch, SearchParams } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';


const Posts: React.FC = () => {
  const columnDefs: Array<ColDef> = [{
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const options: Array<{ [key: string]: any }> = columnDefs
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: Array<{ [key: string]: any }> = columnDefs
    .filter(column => !column.hide)
    .map(column => ({ value: column.field, label: column.headerName }));

  const [selectedOptions, setSelectedOptions] = useState(defaultOptions);

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

  const gridApi = useRef<GridApi>();
  const columnApi = useRef<ColumnApi>();
  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;
  }

  const handleOnSelectChange = (value: any) => {
    setSelectedOptions(value);

    columnDefs.forEach(column => {
      let colIndex = value.findIndex((option: any) => option.value === column.field);
      if (columnApi.current) {
        columnApi.current.moveColumn((column.field as string), colIndex);
        columnApi.current.setColumnVisible((column.field as string), colIndex >= 0);
      }
    });
  };

  const handleColumnDragStopped = (event: DragStoppedEvent) => {
    if (columnApi.current) {
      setSelectedOptions(event.columnApi.getAllDisplayedColumns().map(column => {
        let colDef = column.getColDef();
        return { value: colDef.field, label: colDef.headerName };
      }));
    }
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
      <div className="my-3">
        <form>
         <div className="form-group">
          <label html-for="visibleColumnSelect">Visible columns:</label>
          <Select
            id="visibleColumnSelect"
            options={options}
            isMulti
            closeMenuOnSelect={false}
            blurInputOnSelect={false}
            onChange={handleOnSelectChange}
            value={selectedOptions}
          />
         </div>
        </form>

      </div>

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
          onDragStopped={handleColumnDragStopped}
        >
        </AgGridReact>
      </div>
    </div>

  );
};

export default Posts;