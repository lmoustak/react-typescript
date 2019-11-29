import React, { useState, useEffect, useRef, useContext } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/all-modules';
import Select from 'react-select';
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Nav, Table, Tooltip, Tab, OverlayTrigger, Form, Row, Col } from 'react-bootstrap';
import { Animated } from "react-animated-css";
import { useFormik } from "formik";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-material.css';

const GridContext: React.Context<AnyObject> = React.createContext<AnyObject>({});

const Posts: React.FC = () => {
  const transitionTimeout = 500;
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

  const openNewTab = (row: AnyObject, isEdit: boolean = false) => {
    if (!extraTabs.find(tab => tab.id.toString() === row.id.toString())) {
      setExtraTabs(prevTabs => [...prevTabs, {...row, show: true, isEdit}]);
    }
    setActiveTab(row.id.toString());
  };

  const closeTab = (tabId: string) => {
    let tabIndex = extraTabs.findIndex(tab => tab.id.toString() === tabId);

    if (tabIndex > -1) {
      const tab = extraTabs[tabIndex];
      tab.show = false;
      setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), tab, ...prevTabs.slice(tabIndex + 1)]);

      if (activeTab === tabId) {
        let newTabId: string = tabIndex === 0 ? "Results" : extraTabs[tabIndex - 1].id.toString();
        setActiveTab(newTabId);
      }

      setTimeout(() => setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), ...prevTabs.slice(tabIndex + 1)]), transitionTimeout);
    }
  };


  const columnDefs: Array<ColDef> = [{
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 40,
    suppressSizeToFit: true,
    lockPosition: true,
    lockVisible: true,
    sortable: false,
    resizable: false,
    filter: false
  }, {
    headerName: "User",
    field: "username"
  }, {
    headerName: "Title",
    field: "title"
  }, {
    headerName: "Body",
    field: "body"
  }, {
    headerName: "Actions",
    width: 120,
    suppressSizeToFit: true,
    suppressMovable: true,
    sortable: false,
    resizable: false,
    filter: false,
    pinned: "right",
    cellRenderer: "actionsCellRenderer"
  }];

  const gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      lockPinned: true
    },
    columnDefs,
    rowHeight: 35,
    suppressRowClickSelection: true,
    frameworkComponents: {
      actionsCellRenderer: ActionsCellRenderer
    }
  };



  const options: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && column.headerName !== "Actions")
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: Array<AnyObject> = columnDefs
    .filter(column => column.headerName && !column.hide && column.headerName !== "Actions")
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
      .filter(column => column.getColDef().headerName && column.getColDef().headerName !== "Actions")
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
        <Tab.Container
          unmountOnExit
          activeKey={activeTab}
          onSelect={(key: string) => setActiveTab(key)}
        >
          <Nav variant="tabs" as="ul">
            <Nav.Item as="li">
              <Nav.Link
                eventKey="Results"
                style={{ cursor: "pointer" }}
              >
                <FontAwesomeIcon icon="search" /> Results
              </Nav.Link>
            </Nav.Item>
            {
              extraTabs.map(tab =>
                <ExtraTab
                  key={tab.id}
                  tabId={tab.id}
                  transitionTimeout={transitionTimeout}
                  showTab={tab.show}
                  closeTab={closeTab}
                />
              )
            }
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="Results">
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
            </Tab.Pane>

            {
            extraTabs.map(tab => (
              <Tab.Pane key={tab.id} eventKey={tab.id.toString()}>
                {
                  tab.isEdit
                    ? <Edit data={tab} showTab={tab.show} transitionTimeout={transitionTimeout} closeTab={closeTab} />
                    : <View data={tab} showTab={tab.show} transitionTimeout={transitionTimeout} />
                }
              </Tab.Pane>
            ))
            }
          </Tab.Content>

        </Tab.Container>
      </div>

    </GridContext.Provider>

  );
};

const ActionsCellRenderer = (props: ICellRendererParams) => {
  const context: AnyObject = useContext(GridContext);
  const { data } = props;
  return (
    <ButtonGroup size="sm">
      <OverlayTrigger
        placement="left"
        delay={{ show: 300, hide: 300 }}
        overlay={<Tooltip id="viewTooltip">View</Tooltip>}
      >
        <Button variant="primary" onClick={() => context.openNewTab(data)}><FontAwesomeIcon fixedWidth icon="eye" /></Button>
      </OverlayTrigger>
      <OverlayTrigger
        placement="left"
        delay={{ show: 300, hide: 300 }}
        overlay={<Tooltip id="editTooltip">Edit</Tooltip>}
      >
        <Button variant="primary" onClick={() => context.openNewTab(data, true)}><FontAwesomeIcon fixedWidth icon="edit" /></Button>
      </OverlayTrigger>
      <OverlayTrigger
        placement="left"
        delay={{ show: 300, hide: 300 }}
        overlay={<Tooltip id="deleteTooltip">Delete</Tooltip>}
      >
        <Button variant="danger" onClick={() => context.deleteRows([data])}><FontAwesomeIcon fixedWidth icon="trash" /></Button>
      </OverlayTrigger>
    </ButtonGroup>
  );
};

const ExtraTab: React.FC<any> = props => {
  const { tabId, showTab, transitionTimeout, closeTab } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Nav.Item as="li">
        <Nav.Link
          eventKey={tabId.toString()}
          style={{ cursor: "pointer" }}
        >
          {tabId.toString()}&nbsp;
          <FontAwesomeIcon
            icon="times"
            size="sm"
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              closeTab(tabId.toString());
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={isHovered ? { color: "red" } : { color: "initial" }}
          />
          
        </Nav.Link>
      </Nav.Item>
    </Animated>
  );
};

const View: React.FC<AnyObject> = (props: AnyObject) => {
  const { data, showTab, transitionTimeout } = props;
  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Row>
        <Col xs sm={6} md={4}>
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
        </Col>
      </Row>
    </Animated>
    
  );
};

const Edit: React.FC<AnyObject> = (props: AnyObject) => {
  const { data, showTab, transitionTimeout, closeTab } = props;
  
  const formik = useFormik({
    initialValues: {title: data.title, body: data.body},
    onSubmit: async values => {
      const res = await axios.put(`https://jsonplaceholder.typicode.com/posts/${props.data.id}`, {
        ...values
      });

      console.log(res);
      closeTab(props.data.id.toString());
    }
  });

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Row>
        <Col xs sm={6} md={4}>
          <Form className="text-left" onSubmit={formik.handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={formik.values.title} onChange={formik.handleChange} />
            </Form.Group>
            <Form.Group controlId="body">
              <Form.Label>Body</Form.Label>
              <Form.Control type="text" name="body" value={formik.values.body} onChange={formik.handleChange} />
            </Form.Group>

            <Button variant="primary" type="submit">Submit</Button>
          </Form>
        </Col>
      </Row>
    </Animated>
    
  );
};

export default Posts;