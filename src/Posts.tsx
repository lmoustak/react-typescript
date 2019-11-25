import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-material.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css';


const Posts: React.FC = () => {
  const columnDefs: Array<ColDef> = [{
    checkboxSelection: true, headerCheckboxSelection: true, width: 60, lockPosition: true, lockVisible: true
  }, {
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }];

  const options: Array<AnyObject> = columnDefs
    .filter(column => column.headerName)
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.hide)
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
  const [data, setData, loading] = useSearch(query);

  const [gridApi, setGridApi] = useState<GridApi>();
  const [columnApi, setColumnApi] = useState<ColumnApi>();
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  }

  const handleOnSelectChange = (value: any) => {
    setSelectedOptions(value);

    columnDefs.forEach(column => {
      let colIndex = value.findIndex((option: any) => option.value === column.field);
      if (columnApi) {
        columnApi.moveColumn((column.field as string), colIndex);
        columnApi.setColumnVisible((column.field as string), colIndex >= 0);
      }
    });
  };

  const handleColumnDragStopped = (event: DragStoppedEvent) => {
    if (columnApi) {
      setSelectedOptions(event.columnApi.getAllDisplayedColumns()
        .filter(column => column.getColDef().headerName)
        .map(column => {
          let colDef = column.getColDef();
          return { value: colDef.field, label: colDef.headerName };
        }));
    }
  };

  useEffect(() => {
    if (gridApi) {
      if (loading) {
        gridApi.showLoadingOverlay();
      } else if (!data.length) {
        gridApi.showNoRowsOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  });

  const deleteSelected = async () => {
    if (gridApi) {
      let selectedNodes = gridApi.getSelectedNodes();
      let removedIds: Array<number> = [];

      await Promise.all(selectedNodes.map(async ({ data }) => {
        try {
          await axios.delete(`https://jsonplaceholder.typicode.com/posts/${data.id}`);
          removedIds.push(data.id);
          //setData((prevData: Array<AnyObject>) => prevData.slice(1));
        } catch (err) {
          console.error(err);
        }
      }));

      setData((prevData: Array<AnyObject>) => prevData.filter(({ id }) => !removedIds.includes(id)));
    }

  };

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

          <div className="form-group">
            <button
              type="button"
              className="btn btn-danger"
              onClick={deleteSelected}
            >
              Delete selected
          </button>
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
          pagination
          paginationAutoPageSize
          rowSelection="multiple"
          onGridReady={onGridReady}
          onDragStopped={handleColumnDragStopped}
        >
        </AgGridReact>
      </div>
    </div>

  );
};

export default Posts;