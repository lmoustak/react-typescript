import React, { useState, useEffect, useRef, useContext } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Nav, NavItem, NavLink, TabContent, TabPane, Table, Badge } from 'reactstrap';
import classnames from "classnames";
import {Animated} from "react-animated-css";

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
        closeTab(row.id.toString());
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
      setExtraTabs(prevTabs => [...prevTabs, {...row, show: true}]);
    }
    setActiveTab(row.id.toString());
  };

  const hideTab = (tabId: string) => {
    const tabIndex = extraTabs.findIndex(tab => tab.id.toString() === tabId);

    if (tabIndex > -1) {
      const tab = extraTabs[tabIndex];
      tab.show = false;

      if (activeTab === tabId) {
        let newTabId = tabIndex === 0 ? "Results" : extraTabs[tabIndex - 1].id.toString();
        setActiveTab(newTabId);
      }

      setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), tab, ...prevTabs.slice(tabIndex + 1)]);
    }
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
    <GridContext.Provider value={{ openNewTab, deleteRows }}>
      <div className="mt-5">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "Results" })}
              onClick={() => setActiveTab("Results")}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon="search" /> Results
            </NavLink>
          </NavItem>
          {
            extraTabs.map(tab =>
              <ExtraTab
                key={tab.id}
                tabId={tab.id}
                showTab={tab.show}
                hideTab={hideTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                closeTab={closeTab}
              />
            )
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
                <View data={tab} showTab={tab.show} />
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
  const { data } = props;
  return (
    <ButtonGroup size="sm">
      <Button width="50px" color="primary" onClick={() => context.openNewTab(data)}><FontAwesomeIcon icon="eye" /> View</Button>
      <Button width="50px" color="primary" onClick={() => console.log(data)}><FontAwesomeIcon icon="edit" /> Edit</Button>
      <Button width="50px" color="danger" onClick={() => context.deleteRows([data])}><FontAwesomeIcon icon="trash" /> Delete</Button>
    </ButtonGroup>
  );
};

const ExtraTab: React.FC<any> = props => {
  const { tabId, showTab, hideTab, activeTab, setActiveTab, closeTab } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={500} animationOutDuration={500} isVisible={showTab}>
      <NavItem>
        <NavLink
          className={classnames({ active: activeTab === tabId.toString() })}
          onClick={() => setActiveTab(tabId.toString())}
          style={{ cursor: "pointer" }}
        >
          {tabId.toString()} <Badge color="info">View</Badge>&nbsp;
          <FontAwesomeIcon
            icon="times"
            size="sm"
            onClick={event => {
              event.stopPropagation();
              hideTab(tabId.toString());
              setTimeout(() => closeTab(tabId.toString()), 500);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={isHovered ? { color: "red" } : { color: "initial" }}
          />
        </NavLink>
      </NavItem>
    </Animated>
  );
};

const View: React.FC<AnyObject> = (props: AnyObject) => {
  const { data, showTab } = props;
  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={500} animationOutDuration={500} isVisible={showTab}>
      <div>
        <Table striped bordered>
          <tbody>
            <tr>
              <th>User Id</th>
              <td>{data.userId}</td>
            </tr>
            <tr>
              <th>Username</th>
              <td>{data.username}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{data.title}</td>
            </tr>
            <tr>
              <th>Body</th>
              <td>{data.body}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Animated>
    
  );
};

export default Posts;