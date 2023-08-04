/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useCallback } from 'react';
import { get } from 'lodash';
import { toast } from 'react-toastify';
import { FaImages, FaSearch, FaPencilAlt, FaEllipsisH } from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Badge,
  Button,
  OverlayTrigger,
  Image,
  Dropdown,
  Tooltip,
} from 'react-bootstrap';

// import lgThumbnail from 'lightgallery/plugins/thumbnail';
// import lgZoom from 'lightgallery/plugins/zoom';
// import LightGallery from 'lightgallery/react';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import TableGfilterNestedrow from '../../components/TableGfilterNestedRow';
import TableNestedrow from '../../components/TableNestedRow';
import GalleryComponent from '../../../../components/GalleryComponent';
import TableGfilterNestedRowHiddenRows from '../../components/TableGfilterNestedRowHiddenRows';
import EditModal from '../../components/EditModal';
import EditModalStatus from '../../components/EditModalStatus';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <Button
    href=""
    size="sm"
    variant="outline-primary"
    className="border-0 m-0"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    {/* &#x25bc; */}
  </Button>
));

// trigger to custom filter
function DefaultColumnFilter() {
  return <> </>;
} // as colunas padrao nao aplicam filtro

function SelectColumnFilterStatus({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => ['ATIVO', 'OFICINA', 'INATIVO'], []);

  // Render a multi-select box
  return (
    <Col>
      <OverlayTrigger
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={(props) => renderTooltip(props, 'Filtragem por status')}
      >
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            size="sm"
            id="dropdown-group"
            className="border-0"
          >
            <FaSearch /> {filterValue}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                setFilter('');
              }}
            >
              Remover Filtro
            </Dropdown.Item>
            {options.map((option, i) => (
              <Dropdown.Item
                key={i}
                onClick={() => {
                  setFilter(option || undefined);
                }}
              >
                {option}{' '}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
    </Col>
  );
}

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  toggleAllRowsExpanded,
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);
  // Render a multi-select box
  return (
    <Col>
      <OverlayTrigger
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={(props) => renderTooltip(props, `Filter for ${id}`)}
      >
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            size="sm"
            id="dropdown-group"
            className="border-0"
            // onClick={() => toggleAllRowsExpanded(true)}
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
          >
            {filterValue ? <span>{filterValue}</span> : <FaSearch />}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                // toggleAllRowsExpanded(false);
                setFilter('');
              }}
            >
              Remover Filtro
            </Dropdown.Item>
            {options.sort().map((option, i) => (
              <Dropdown.Item
                key={i}
                onClick={() => {
                  setFilter(option || undefined);
                }}
              >
                {option}{' '}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
    </Col>
  );
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditModalStatus, setShowEditModalStatus] = useState(false);
  const [dataModal, setDataModal] = useState('');
  const [dataModalStatus, setDataModalStatus] = useState('');

  async function getData() {
    try {
      setIsLoading(true);
      const response = await axios.get('/cars/');
      setCars(response.data);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  }

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseEditModalStatus = () => setShowEditModalStatus(false);
  const handleSaveEditModal = () => {
    setShowEditModal(false);
    getData();
  };
  const handleSaveEditModalStatus = () => {
    setShowEditModalStatus(false);
    getData();
  };
  const handleShowEditModal = (data) => {
    setDataModal(data);
    setShowEditModal(true);
  };
  const handleShowEditModalStatus = (data) => {
    setDataModalStatus(data);
    setShowEditModalStatus(true);
  };

  useEffect(() => {
    // async function getData() {
    //   try {
    //     setIsLoading(true);
    //     const response = await axios.get('/cars/');
    //     setCars(response.data);
    //     setIsLoading(false);
    //   } catch (err) {
    //     // eslint-disable-next-line no-unused-expressions
    //     err.response?.data?.errors
    //       ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
    //       : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
    //     setIsLoading(false);
    //   }
    // }

    getData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        // Make an expander cell
        Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
          <span {...getToggleAllRowsExpandedProps()}>
            {isAllRowsExpanded ? '▽' : '▷'}
          </span>
        ),
        id: 'expander', // It needs an ID
        width: 30,
        disableResizing: true,
        Cell: ({ row }) => (
          // Use Cell to render an expander for each row.
          // We can use the getToggleRowExpandedProps prop-getter
          // to build the expander.
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? '▽' : '▷'}
          </span>
        ),
      },
      {
        Header: 'ID',
        accessor: 'id',
        width: 100,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
        Cell: ({ row, value }) => {
          const getItems = useCallback(
            () => (
              <Button
                // size="sm"
                variant="outline-primary"
                className="border-0 m-0"
              >
                <FaImages />
              </Button>
            ),
            []
          );
          return (
            <>
              <div className="text-center">{value}</div>
              <div className="text-center">
                {row.original.CarPhotos?.length > 0 ? getItems() : null}
              </div>
            </>
          );
        },
      },
      {
        Header: 'Marca',
        accessor: 'brand',
        disableSortBy: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Modelo - Apelido',
        accessor: (originalRow) =>
          `${originalRow.model} - ${originalRow.alias}`,
        disableSortBy: true,
      },
      {
        Header: 'Placa',
        accessor: 'plate',
        disableSortBy: true,
      },
      {
        Header: 'Categoria',
        accessor: (originalRow) => originalRow.Cartype?.type,
        disableSortBy: true,
        Filter: SelectColumnFilter,
      },
      {
        Header: 'Combustível',
        accessor: (originalRow) => originalRow.CarFueltype?.type,
        disableSortBy: true,
        width: 120,
      },
      {
        Header: 'Status',
        id: 'Satus',
        accessor: (originalRow) =>
          originalRow.CarStatuses[originalRow.CarStatuses.length - 1]
            ?.CarStatustype.type,
        width: 140,
        disableResizing: true,

        defaultCanFilter: true,
        Filter: SelectColumnFilterStatus,
        filter: 'groupStatus',
        isVisible: window.innerWidth > 768,
        disableSortBy: true,
      },
      {
        Header: 'Ações',
        id: 'actions',
        width: 75,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row }) => (
          <Row className="d-flex flex-nowrap justify-content-center">
            <Col xs="auto" className="text-center m-0 p-0 px-1">
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Opções')}
              >
                <Dropdown>
                  <Dropdown.Toggle
                    as={CustomToggle}
                    id="dropdown-custom-components"
                  >
                    <FaEllipsisH />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() => handleShowEditModal(row.original)}
                    >
                      Editar Veículo
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() => handleShowEditModalStatus(row.original)}
                    >
                      Editar Status
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </OverlayTrigger>
            </Col>
          </Row>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => cars, [cars]);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      // disableSortBy: true,
      minWidth: 30,
      width: 120,
      maxWidth: 800,
    }),
    []
  );

  const initialState = {
    sortBy: [
      {
        id: 'name',
        asc: true,
      },
    ],
    hiddenColumns: columns
      .filter((col) => col.isVisible === false)
      .map((col) => col.accessor),
    pageSize: 50,
  };

  const filterTypes = React.useMemo(
    () => ({
      // Override the default text filter to use
      // "startWith"
      text: (rows, ids, filterValue) => {
        rows = rows.filter((row) =>
          ids.some((id) => {
            const rowValue = row.values[id];
            const arrayFilter = String(filterValue).split(' ');

            return arrayFilter.reduce((res, cur) => {
              // res -> response; cur -> currency (atual)
              res =
                res &&
                String(rowValue)
                  .toLowerCase()
                  .includes(String(cur).toLowerCase());
              return res;
            }, true);
          })
        );
        return rows;
      },
    }),
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <span className="fw-bold">Especificação:</span>
        {row.original.obs}
      </>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <Row className="mb-2">
          <Col>
            {' '}
            <Badge>DEMAIS INFORMAÇÕES SOBRE O VEÍCULO</Badge>
            {/* {JSON.stringify(row.original.CarStatuses)} */}
          </Col>
        </Row>
        <Row>
          <Col>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={[
                {
                  // Make an expander cell
                  Header: ({
                    getToggleAllRowsExpandedProps,
                    isAllRowsExpanded,
                  }) => (
                    <span {...getToggleAllRowsExpandedProps()}>
                      {isAllRowsExpanded ? '▽' : '▷'}
                    </span>
                  ),
                  id: 'expander', // It needs an ID
                  width: 30,
                  disableResizing: true,
                  Cell: ({ row }) => (
                    // Use Cell to render an expander for each row.
                    // We can use the getToggleRowExpandedProps prop-getter
                    // to build the expander.
                    <span {...row.getToggleRowExpandedProps()}>
                      {row.isExpanded ? '▽' : '▷'}
                    </span>
                  ),
                },
                {
                  Header: 'Cor',
                  accessor: 'color',
                  width: 120,
                  disableResizing: true,
                  disableSortBy: true,
                },
                {
                  Header: 'Renavan',
                  accessor: 'renavan',
                },
                {
                  Header: 'Ano',
                  accessor: 'year',
                },
                {
                  Header: 'Chassi',
                  accessor: 'chassi',
                },
                {
                  Header: 'Carga Útil',
                  accessor: 'payload',
                },
                {
                  Header: 'Peso Bruto Total',
                  accessor: 'weight',
                },
                {
                  Header: 'Vol.Tanque',
                  accessor: 'fuelVolume',
                },
                {
                  Header: 'Cap. Pessoas',
                  accessor: 'peopleCapacity',
                },
              ]}
              data={[row.original]}
              defaultColumn={{
                // Let's set up our default Filter UI
                // Filter: DefaultColumnFilter,
                minWidth: 30,
                width: 50,
                maxWidth: 800,
              }}
              initialState={{
                sortBy: [
                  {
                    id: 'name',
                    asc: true,
                  },
                ],
                hiddenColumns: [
                  ...columns
                    .filter((col) => col.isVisible === false)
                    .map((col) => col.id),
                  ...columns
                    .filter((col) => col.isVisible === false)
                    .map((col) => col.accessor),
                ],
              }}
              filterTypes={filterTypes}
              renderRowSubComponent={renderRowSubSubComponent}
            />
            {row.original.CarAccessories?.length ? (
              <>
                <Row>
                  <Col className="text-center">
                    <span className="text-center fw-bold">ACESSÓRIOS</span>
                    {/* {JSON.stringify(row.original.CarAccessories)} */}
                  </Col>
                </Row>
                <TableNestedrow
                  style={{ padding: 0, margin: 0 }}
                  columns={[
                    {
                      Header: 'Acessório',
                      accessor: (originalRow) =>
                        originalRow.CarAccessorytype.type,
                      width: 200,
                      disableResizing: true,
                      disableSortBy: true,
                    },
                    {
                      Header: 'Capacidade de Carga',
                      accessor: 'payload',
                    },
                    {
                      Header: 'Tamanho',
                      accessor: 'dimension',
                    },
                    {
                      Header: 'Observação',
                      accessor: 'obs',
                    },
                  ]}
                  data={row.original.CarAccessories}
                  defaultColumn={{
                    minWidth: 30,
                    width: 50,
                    maxWidth: 800,
                  }}
                  filterTypes={filterTypes}
                />
              </>
            ) : null}
            {row.original.CarPhotos?.length ? (
              <>
                <br />
                <Row>
                  <Col className="text-center">
                    <span className="text-center fw-bold">IMAGENS</span>
                  </Col>
                </Row>
                <TableNestedrow
                  style={{ padding: 0, margin: 0 }}
                  columns={[]}
                  data={row.original.CarPhotos}
                  defaultColumn={{
                    // Let's set up our defaul2t Filter UI
                    // Filter: DefaultColumnFilter,
                    minWidth: 30,
                    width: 50,
                    maxWidth: 800,
                  }}
                  initialState={{
                    sortBy: [
                      {
                        id: 'name',
                        asc: true,
                      },
                    ],
                    hiddenColumns: columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.accessor),
                  }}
                  filterTypes={filterTypes}
                  renderRowSubComponent={renderRowSubSubComponent}
                />
              </>
            ) : null}
            {row.original.CarPhotos?.length ? (
              <GalleryComponent
                images={row.original.CarPhotos}
                hasDimensions={false}
              />
            ) : null}
          </Col>
        </Row>
        <Row>
          {/* <div>{row.original.CarPhotos.length > 0 ? (

          ) : null}</div> */}
        </Row>
      </>
    ),
    []
  );

  return (
    <>
      <Loading isLoading={isLoading} />
      <EditModal // modal p/ pesquisa de materiais
        handleClose={handleCloseEditModal}
        show={showEditModal}
        data={dataModal}
        handleSave={handleSaveEditModal}
      />
      <EditModalStatus // modal p/ pesquisa de materiais
        handleClose={handleCloseEditModalStatus}
        show={showEditModalStatus}
        data={dataModalStatus}
        handleSave={handleSaveEditModalStatus}
      />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Automóveis Cadastrados</Card.Title>
          <Card.Text>Cadastros realizados no sisman.</Card.Text>
        </Row>

        <TableGfilterNestedRowHiddenRows
          columns={columns}
          data={data}
          defaultColumn={defaultColumn}
          initialState={initialState}
          filterTypes={filterTypes}
          renderRowSubComponent={renderRowSubComponent}
        />
      </Container>
    </>
  );
}
