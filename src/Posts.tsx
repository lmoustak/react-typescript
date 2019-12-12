import React, { useState, useEffect, useRef, useContext } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules, GridApi, GridReadyEvent, ColumnApi, ColDef, DragStoppedEvent, GridOptions, ICellRendererParams } from "@ag-grid-community/all-modules";
import Select from "react-select";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Nav, Table, Tooltip, Tab, OverlayTrigger, Form, Row, Col, Badge, ButtonToolbar } from "react-bootstrap";
import { Animated } from "react-animated-css";
import useForm from "react-hook-form";
import { RHFInput } from "react-hook-form-input";

import { useSearch, SearchParams, AnyObject } from "./hooks/useSearch";

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css";

const GridContext: React.Context<AnyObject> = React.createContext<AnyObject>({});

const Posts: React.FC = () => {
  const transitionTimeout = 500;
  const [extraTabs, setExtraTabs] = useState<AnyObject[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Results");

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
  const [data, setData, loading] = useSearch(query);

  const createRows = async (rows: any[]) => {
    let toBeCreated: any[] = [];
    await Promise.all(rows.map(async row => {
      const user = row.user.value;
      row = { ...row, userId: user.id, username: user.name }
      try {
        const { data: responseData } = await axios.post(`https://jsonplaceholder.typicode.com/posts`, {
          ...row, userId: row.user.id
        });
        toBeCreated.push({ ...row, ...responseData });
        closeTab("Create");
      } catch (err) {
        console.error(err);
      }
    }));

    setData(prevData => [...prevData, ...toBeCreated]);

  };

  const editRows = async (rows: any[]) => {
    let toBeUpdated: any[] = [];
    await Promise.all(rows.map(async row => {
      try {
        const { data: responseData } = await axios.put(`https://jsonplaceholder.typicode.com/posts/${row.id}`, {
          ...row
        });
        toBeUpdated.push({ ...row, ...responseData });
        closeTab(row.id.toString());
      } catch (err) {
        console.error(err);
      }
    }));


    setData(prevData => {
      let newData = [...prevData];
      toBeUpdated.forEach(update => {
        const index = newData.findIndex(data => data.id === update.id);
        newData[index] = update;
      });

      return newData;
    });

  };

  const deleteRows = async (rows: any[]) => {
    let toBeDeleted: any[] = [];
    await Promise.all(rows.map(async row => {
      try {
        const { data: responseData } = await axios.delete(`https://jsonplaceholder.typicode.com/posts/${row.id}`);
        toBeDeleted.push({ ...row, ...responseData });
        closeTab(row.id.toString());
      } catch (err) {
        console.error(err);
      }
    }));

    setData(prevData => {
      let newData = [...prevData];
      toBeDeleted.forEach(remove => {
        const index = newData.findIndex(data => data.id === remove.id);
        newData.splice(index, 1);
      });

      if (gridApi.current) {
        gridApi.current.redrawRows();
      }

      return newData;
    });


  };

  const deleteSelected = () => {
    if (gridApi.current) {
      deleteRows(gridApi.current.getSelectedRows());
    }

  };

  const openNewTab = (row: AnyObject | null, tabMode: string = "view") => {
    if (row != null) {
      if (!extraTabs.find(tab => tab.id.toString() === row.id.toString())) {
        setExtraTabs(prevTabs => [...prevTabs, { data: { ...row }, show: true, tabMode }]);
      }
      setActiveTab(row.id.toString());
    } else if (tabMode.toLowerCase() === "create") {
      if (!extraTabs.find(tab => tab.id.toString() === "Create")) {
        setExtraTabs(prevTabs => [...prevTabs, { data: { id: "Create" }, show: true, tabMode }]);
      }
      setActiveTab("Create");
    }

  };

  const closeTab = (tabId: string | number) => {
    if (typeof tabId === "number") {
      tabId = tabId.toString();
    }

    let tabIndex = extraTabs.findIndex(tab => tab.data.id.toString() === tabId);

    if (tabIndex > -1) {
      const tab = { ...extraTabs[tabIndex] };
      tab.show = false;
      setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), tab, ...prevTabs.slice(tabIndex + 1)]);

      if (activeTab === tabId) {
        let newTabId: string = tabIndex === 0 ? "Results" : extraTabs[tabIndex - 1].id.toString();
        setActiveTab(newTabId);
      }

      setTimeout(() => setExtraTabs(prevTabs => [...prevTabs.slice(0, tabIndex), ...prevTabs.slice(tabIndex + 1)]), transitionTimeout);
    }
  };

  const columnDefs: ColDef[] = [{
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
    },
    getRowNodeId: data => data.id
  };



  const options: AnyObject[] = columnDefs
    .filter(column => column.headerName && column.headerName !== "Actions")
    .map(column => ({ value: column.field, label: column.headerName }));

  const defaultOptions: AnyObject[] = columnDefs
    .filter(column => column.headerName && !column.hide && column.headerName !== "Actions")
    .map(column => ({ value: column.field, label: column.headerName }));

  const [selectedOptions, setSelectedOptions] = useState(defaultOptions);


  const gridApi = useRef<GridApi>();
  const columnApi = useRef<ColumnApi>();
  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
    columnApi.current = params.columnApi;
    gridApi.current.sizeColumnsToFit();
  };

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
                  key={tab.data.id}
                  tabId={tab.data.id}
                  transitionTimeout={transitionTimeout}
                  showTab={tab.show}
                  closeTab={closeTab}
                  tabMode={tab.tabMode}
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
                    <ButtonToolbar>
                      <Button
                        variant="success"
                        onClick={() => openNewTab(null, "create")}
                      >
                        <FontAwesomeIcon icon="plus" /> Create New Post
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => deleteSelected()}
                      >
                        <FontAwesomeIcon icon="trash" /> Delete selected
                    </Button>

                    </ButtonToolbar>
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
            </Tab.Pane>

            {
              extraTabs.map(tab => {
                let tabComponent;

                switch (tab.tabMode.toLowerCase()) {
                  case "create":
                    tabComponent = (
                      <Create
                        showTab={tab.show}
                        transitionTimeout={transitionTimeout}
                        createEntity={createRows}
                      />
                    );
                    break;
                  case "update":
                    tabComponent = (
                      <Edit
                        data={tab.data}
                        showTab={tab.show}
                        transitionTimeout={transitionTimeout}
                        editEntity={editRows}
                      />
                    );
                    break;
                  case "view":
                    tabComponent = (
                      <View
                        data={tab.data}
                        showTab={tab.show}
                        transitionTimeout={transitionTimeout}
                        deleteEntity={deleteRows}
                      />
                    );
                    break;
                  default:
                    break;
                }
                return (
                  <Tab.Pane key={tab.data.id} eventKey={tab.data.id.toString()}>
                    {tabComponent}
                  </Tab.Pane>
                )
              })
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
        <Button variant="primary" onClick={() => context.openNewTab(data, "update")}><FontAwesomeIcon fixedWidth icon="edit" /></Button>
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
  const { tabId, showTab, transitionTimeout, tabMode, closeTab } = props;

  const [isHovered, setIsHovered] = useState(false);

  const badge = (tabMode: string) => {
    switch (tabMode.toLowerCase()) {
      case "view":
        return <Badge variant="info">View</Badge>;
      case "update":
        return <Badge variant="warning">Update</Badge>;
    }
  };

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Nav.Item as="li">
        <Nav.Link
          eventKey={tabId.toString()}
          style={{ cursor: "pointer" }}
        >
          {tabId.toString()}
          &nbsp;
          {badge(tabMode)}
          &nbsp;
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
  const { data, showTab, transitionTimeout, deleteEntity } = props;
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

          <Button variant="danger" onClick={() => deleteEntity([data])}><FontAwesomeIcon fixedWidth icon="trash" /> Delete</Button>
        </Col>
      </Row>
    </Animated>

  );
};

const Edit: React.FC<AnyObject> = (props: AnyObject) => {
  const { data, showTab, transitionTimeout, editEntity } = props;

  const { register, handleSubmit, errors } = useForm({
    defaultValues: { ...data },
    mode: "onBlur"
  });

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Row>
        <Col xs sm={6} md={4}>
          <Form className="text-left" onSubmit={handleSubmit(async values => editEntity([{ ...data, ...values }]))}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" ref={register({required: true}) as any} />
              {errors.title && <span style={{color: "red"}}>Required</span>}
            </Form.Group>
            <Form.Group controlId="body">
              <Form.Label>Body</Form.Label>
              <Form.Control type="text" name="body" ref={register({required: true}) as any} />
              {errors.body && <span style={{color: "red"}}>Required</span>}
            </Form.Group>

            <Button variant="primary" type="submit" disabled={Object.keys(errors).length > 0}>Submit</Button>
          </Form>
        </Col>
      </Row>
    </Animated>

  );
};

const Create: React.FC<AnyObject> = (props: AnyObject) => {
  const { showTab, transitionTimeout, createEntity } = props;
  const [usersData] = useSearch("https://jsonplaceholder.typicode.com/users");

  const { register, handleSubmit, setValue, errors } = useForm({ mode: "onBlur" });

  return (
    <Animated animationIn="fadeIn" animationOut="fadeOut" animationInDuration={transitionTimeout} animationOutDuration={transitionTimeout} isVisible={showTab}>
      <Row>
        <Col xs sm={6} md={4}>
          <Form className="text-left" onSubmit={handleSubmit(async values => createEntity([{ ...values }]))}>
            <Form.Group controlId="user">
              <Form.Label>User</Form.Label>
              <RHFInput
                as={<Select options={usersData.map(user => ({ value: user, label: user.name }))} isClearable />}
                rules={{required: true}}
                name="user"
                register={register}
                setValue={setValue}
                mode="onChange"
              />
              {errors.user && <span style={{color: "red"}}>Required</span>}
            </Form.Group>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" ref={register({required: true}) as any} />
              {errors.title && <span style={{color: "red"}}>Required</span>}
            </Form.Group>
            <Form.Group controlId="body">
              <Form.Label>Body</Form.Label>
              <Form.Control type="text" name="body" ref={register({required: true}) as any} />
              {errors.body && <span style={{color: "red"}}>Required</span>}
            </Form.Group>
            
            <Button variant="primary" type="submit" disabled={Object.keys(errors).length > 0}>Submit</Button>
          </Form>
        </Col>
      </Row>
    </Animated>

  );
};

export default Posts;