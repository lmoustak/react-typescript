import React, { useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, ICellRendererParams, GridOptions } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";
import {Tabs, TabList, Tab, PanelList, Panel} from 'react-tabtab';
import * as bulmaStyle from 'react-tabtab/lib/themes/bulma'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-material.css';


const Posts: React.FC = () => {
  const columnDefs: Array<ColDef> = [{
    checkboxSelection: true, headerCheckboxSelection: true, width: 40, lockPosition: true, lockVisible: true
  }, {
    headerName: "User", field: "username", sortable: true, filter: true
  }, {
    headerName: "Title", field: "title", sortable: true, filter: true
  }, {
    headerName: "Body", field: "body", sortable: true, filter: true
  }, {
    headerName: "Actions", width: 125, sortable: false, pinned: "right", lockPinned: true, cellRenderer: "actionsCellRenderer"
  }];

  const gridOptions: GridOptions = {
    columnDefs,
    rowHeight: 35,
    frameworkComponents: {
      actionsCellRenderer: (params: ICellRendererParams) => (
        <div className="btn-group btn-group-sm">
          <button type="button" className="btn btn-primary" onClick={() => console.log(params.data)} title="View"><FontAwesomeIcon fixedWidth icon="eye" /></button>
          <button type="button" className="btn btn-secondary" onClick={() => console.log(params.data)} title="Edit"><FontAwesomeIcon fixedWidth icon="edit" /></button>
          <button type="button" className="btn btn-danger" onClick={() => console.log(params.data)} title="Delete"><FontAwesomeIcon fixedWidth icon="times" /></button>
        </div>
      )
    }
  };

  

  const options: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.lockPinned)
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.hide && !column.lockPinned)
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
        .filter(column => column.getColDef().headerName  && !column.getColDef().lockPinned)
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
      <Tabs customStyle={bulmaStyle}>
        <TabList>
          <Tab>
            <FontAwesomeIcon icon="search" /> Results
          </Tab>
          <Tab closable>
            View
          </Tab>
        </TabList>
        <PanelList>
          <Panel>
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

              <div
                className="ag-theme-balham"
                style={{
                  height: '500px',
                  width: '100%'
                }}
              >
                <AgGridReact
                  gridOptions={gridOptions}
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
          </Panel>

          <Panel>
            {data && <View data={data[0]} />}
          </Panel>
        </PanelList>
      </Tabs>

      
    </div>

  );
};

const View: React.FC<AnyObject> = (props: AnyObject) => {
  const data = props.data;
  return (
    <div>
      <p>UserId: {data.userId}</p>
      <p>Username: {data.username}</p>
      <p>Title: {data.title}</p>
      <p>Body: {data.body}</p>
    </div>
  );
};

export default Posts;