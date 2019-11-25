import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, ICellRendererParams, GridOptions, RowNode } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";
import { Tabs, TabList, Tab, PanelList, Panel } from 'react-tabtab';
import * as bulmaStyle from 'react-tabtab/lib/themes/bulma'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-material.css';


const Posts: React.FC = () => {
  const [extraTabs, setExtraTabs] = useState<Array<AnyObject>>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tabHistory, setTabHistory] = useState<Array<number>>([0]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setTabHistory(prevHistory => [...prevHistory.filter(tabIndex => tabIndex !== index), index]);
  };

  const handleTabClose = ({ type, index }: { type: string, index: number }) => {
    setExtraTabs(prevTabs => {
      let tabs = [...prevTabs];
      if (type === "delete") {
        tabs = [...tabs.slice(0, index - 1), ...tabs.slice(index)];
        setTabHistory(prevHistory => {
          const history = [...prevHistory];
          const newHistory = history.filter(idx => idx !== index).map(idx => idx > index ? idx - 1 : idx);
          setActiveTab(newHistory[newHistory.length - 1]);
          return newHistory;
        });
      }

      return tabs;
    });
  };

  const deleteRows = async (rows: Array<any>) => {
    let toBeDeleted: Array<any> = [];
    await Promise.all(rows.map(async row => {
      try {
        await axios.delete(`https://jsonplaceholder.typicode.com/posts/${row.id}`);
        toBeDeleted.push(row);
      } catch (err) {
        console.error(err);
      }
    }));

    if (gridApi.current) {
      gridApi.current.updateRowData({ remove: toBeDeleted });
      /* let data: Array<AnyObject> = [];
      gridApi.current.forEachNode(node => data.push(node.data))
      setData(data); */
    }
  };

  const deleteSelected = () => {
    if (gridApi.current) {
      deleteRows(gridApi.current.getSelectedRows());
    }

  };


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
          <button type="button" className="btn btn-primary" onClick={() => setExtraTabs(prevTabs => [...prevTabs, params.data])} title="View"><FontAwesomeIcon fixedWidth icon="eye" /></button>
          <button type="button" className="btn btn-secondary" onClick={() => console.log(params.data)} title="Edit"><FontAwesomeIcon fixedWidth icon="edit" /></button>
          <button type="button" className="btn btn-danger" onClick={() => deleteRows([params.data])} title="Delete"><FontAwesomeIcon fixedWidth icon="times" /></button>
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

  const gridApi = useRef<GridApi>();
  const [columnApi, setColumnApi] = useState<ColumnApi>();
  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
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
        .filter(column => column.getColDef().headerName && !column.getColDef().lockPinned)
        .map(column => {
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
      <Tabs
        customStyle={bulmaStyle}
        onTabChange={handleTabChange}
        onTabEdit={handleTabClose}
        activeIndex={activeTab}
      >
        <TabList>
          <Tab>
            <FontAwesomeIcon icon="search" /> Results
          </Tab>
          {
            extraTabs.map(tab => (
              <Tab closable key={tab.id}>
                {tab.id}
              </Tab>
            ))
          }
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
                    onClick={() => deleteSelected()}
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
                  animateRows
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

          {/* {data && <View data={data[0]} />} */}
          {
            extraTabs.map(tab => (
              <Panel key={tab.id}>
                <View data={tab} />
              </Panel>
            ))
          }
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