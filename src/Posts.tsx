import React, { useState, useEffect, useRef, useContext } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from "classnames";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-material.css';

const GridContext: React.Context<AnyObject> = React.createContext<AnyObject>({});

const Posts: React.FC = () => {
  const [extraTabs, setExtraTabs] = useState<Array<AnyObject>>([]);
  const [activeTab, setActiveTab] = useState<string>("Results");

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
    }
  };

  const deleteSelected = () => {
    if (gridApi.current) {
      deleteRows(gridApi.current.getSelectedRows());
    }

  };

  const openNewTab = (row: AnyObject) => {
    if (!extraTabs.find(tab => tab.id.toString() === row.id.toString())) {
      setExtraTabs(prevTabs => [...prevTabs, row]);
    }
    setActiveTab(row.id.toString());
  };

  const closeTab = (tabId: string) => {
    let tabIndex = extraTabs.findIndex(tab => tab.id.toString() === tabId);

    if (tabIndex > -1) {
      if (activeTab === tabId) {
        let newTabId = tabIndex === 0 ? "Results" : extraTabs[tabIndex - 1].id.toString();
        setActiveTab(newTabId);
      }
      setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), ...prevTabs.slice(tabIndex + 1)]);
    }
  };

  const handleCloseTab = (tabId: string, event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    closeTab(tabId);
  };


  const columnDefs: Array<ColDef> = [{
    checkboxSelection: true, headerCheckboxSelection: true, width: 40, suppressSizeToFit: true, lockPosition: true, lockVisible: true, sortable: false, resizable: false, filter: false
  }, {
    headerName: "User", field: "username"
  }, {
    headerName: "Title", field: "title"
  }, {
    headerName: "Body", field: "body"
  }, {
    headerName: "Actions", width: 220, suppressSizeToFit: true, sortable: false, resizable: false, filter: false, pinned: "right", lockPinned: true, cellRenderer: "actionsCellRenderer"
  }];

  const gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    },
    columnDefs,
    rowHeight: 35,
    suppressRowClickSelection: true,
    frameworkComponents: {
      actionsCellRenderer: ActionsCellRenderer
    }
  };



  const options: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.lockPinned)
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.hide && !column.lockPinned)
    .map(column => ({ value: column.field, label: column.headerName }));

  const [selectedOptions, setSelectedOptions] = useState(defaultOptions);

  // eslint-disable-next-line
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
    gridApi.current.sizeColumnsToFit();
  }

  const handleOnSelectChange = (value: any) => {
    setSelectedOptions(value);

    columnDefs.forEach(column => {
      let colIndex = value.findIndex((option: any) => option.value === column.field);
      if (columnApi.current) {
        columnApi.current.moveColumn((column.field as string), colIndex + 1);
        columnApi.current.setColumnVisible((column.field as string), colIndex >= 0);
      }
    });
  };

  const handleColumnDragStopped = (event: DragStoppedEvent) => {
    setSelectedOptions(event.columnApi.getAllDisplayedColumns()
      .filter(column => column.getColDef().headerName && !column.getColDef().lockPinned)
      .map(column => {
        let colDef = column.getColDef();
        return { value: colDef.field, label: colDef.headerName };
      }));
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
    <GridContext.Provider value={{openNewTab, deleteRows}}>
      <div className="mt-5">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({active: activeTab === "Results"})}
              onClick={() => setActiveTab("Results")}
            >
              <FontAwesomeIcon icon="search" /> Results
            </NavLink>
          </NavItem>
          {
            extraTabs.map(tab => (
              <NavItem key={tab.id} className="animated fadeIn">
                <NavLink
                  className= {classnames({active: activeTab === tab.id.toString()})}
                  onClick={() => setActiveTab(tab.id.toString())}
                >
                  {tab.id.toString()} <FontAwesomeIcon icon="times" size="sm" onClick={event => handleCloseTab(tab.id.toString(), event)} />
                </NavLink>
              </NavItem>
            ))
          }
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="Results">
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
          </TabPane>
          {
            extraTabs.map(tab => (
              <TabPane key={tab.id} tabId={tab.id.toString()}>
                <View data={tab} />
              </TabPane>
            ))
          }
        </TabContent>
      </div>

    </GridContext.Provider>

  );
};

const ActionsCellRenderer = (props: ICellRendererParams) => {
  const context: AnyObject = useContext(GridContext);
  return (
    <ButtonGroup size="sm">
      <Button width="50px" color="primary" onClick={() => context.openNewTab(props.data)}><FontAwesomeIcon icon="eye" /> View</Button>
      <Button width="50px" color="secondary" onClick={() => console.log(props.data)}><FontAwesomeIcon icon="edit" /> Edit</Button>
      <Button width="50px" color="danger" onClick={() => context.deleteRows([props.data])}><FontAwesomeIcon icon="trash" /> Delete</Button>
    </ButtonGroup>
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