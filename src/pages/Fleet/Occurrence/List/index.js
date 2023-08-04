/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaImages, FaSearch, FaPencilAlt } from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Badge,
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
// import TableGfilterNestedrow from '../../components/TableGfilterNestedRow';
import TableGfilterNestedrowHiddenRows from '../../components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../components/TableNestedRow';
import GalleryComponent from '../../../../components/GalleryComponent';
import EditModal from './components/EditModalOccurrence';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

// trigger to custom filter
function DefaultColumnFilter() {
  return <> </>;
} // as colunas padrao nao aplicam filtro

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
  const [dataModal, setDataModal] = useState('');
  // const [carsOccurrences, setCarsOccurrences] = useState([]);

  async function getData() {
    try {
      setIsLoading(true);
      const response = await axios.get('/cars/occurrences/');
      // const response2 = await axios.get('/cars/occurrences');
      setCars(response.data);
      // setCarsOccurrences(response2.data);
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
  const handleSaveEditModal = () => {
    setShowEditModal(false);
    getData();
  };
  const handleShowEditModal = (data) => {
    setDataModal(data);
    setShowEditModal(true);
  };
  useEffect(() => {
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
        // accessor: (originalRow) => originalRow.Car?.id,
        accessor: 'id',
        width: 80,
        disableResizing: true,
        disableSortBy: false,
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
                {row.original.CarOccurrencePhotos.length > 0
                  ? getItems()
                  : null}
              </div>
            </>
          );
        },
      },
      {
        Header: 'Veículo',
        accessor: (originalRow) =>
          `${originalRow.Car?.alias} - ${originalRow.Car?.model} - ${originalRow.Car?.plate}`,
      },
      {
        Header: 'Marca',
        accessor: (originalRow) => originalRow.Car?.brand,
        Filter: SelectColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Tipo de Ocorrência',
        accessor: (originalRow) => originalRow.CarOccurrencetype?.type,
        Filter: SelectColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Motorista',
        accessor: (originalRow) => originalRow.Worker?.name,
        Filter: SelectColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Data da Ocorrência',
        accessor: 'data',
        disableSortBy: false,
      },
      // {
      //   Header: 'Categoria',
      //   accessor: (originalRow) => originalRow.Car.Cartype?.type,
      // },
      {
        Header: '',
        id: 'actions',
        width: 50,
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
                overlay={(props) => renderTooltip(props, 'Editar veículo')}
              >
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="border-0 m-0"
                  onClick={() => handleShowEditModal(row.original)}
                  hidden={
                    row.original?.withdrawnAtBr ||
                    row.original?.separatedAtBr ||
                    row.original?.canceledAtBr
                  }
                >
                  <FaPencilAlt />
                </Button>
              </OverlayTrigger>
            </Col>
            {/* <Col xs="auto" className="text-center m-0 p-0 px-1">
              <>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) => renderTooltip(props, 'Excluir veículo')}
                >
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="border-0"
                    onClick={(e) => {
                      handleCancelAsk(e, row.original);
                    }}
                    hidden={
                      row.original?.withdrawnAtBr ||
                      row.original?.separatedAtBr ||
                      row.original?.canceledAtBr
                    }
                  >
                    <FaTimes />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) => renderTooltip(props, 'Confirmar ação')}
                >
                  <Button
                    size="sm"
                    variant="outline-warning"
                    className="border-0 d-none"
                    // onClick={() => {
                    //   handleCancelReserve(row.original);
                    // }}
                  >
                    <FaExclamation />
                  </Button>
                </OverlayTrigger>
              </>
            </Col> */}
          </Row>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => cars, [cars]);
  // const data2 = React.useMemo(() => carsOccurrences, [carsOccurrences]);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
      disableSortBy: true,
      minWidth: 30,
      width: 120,
      maxWidth: 800,
    }),
    []
  );

  const initialState = {
    sortBy: [
      {
        id: 'id',
        asc: true,
      },
    ],
    hiddenColumns: columns
      .filter((col) => col.isVisible === false)
      .map((col) => col.accessor),
    pageSize: 20,
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

  const renderRowSubSubComponent = React.useCallback(({ row }) => <></>, []);

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <Row className="mb-2">
          <Col>
            {' '}
            <Badge>OCORRÊNCIAS DO VEÍCULO</Badge>
          </Col>
        </Row>
        <Row>
          <Col>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={[
                {
                  Header: 'Especificações',
                  accessor: 'obs',
                },
              ]}
              data={[row.original]}
              defaultColumn={{
                minWidth: 30,
                width: 50,
                maxWidth: 800,
              }}
              initialState={{
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
            {row.original.CarOccurrencePhotos.length ? (
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
                  data={row.original.CarOccurrencePhotos}
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
                    hiddenColumns: columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.accessor),
                  }}
                  filterTypes={filterTypes}
                  renderRowSubComponent={renderRowSubSubComponent}
                />
              </>
            ) : null}
            {row.original.CarOccurrencePhotos.length ? (
              <GalleryComponent
                images={row.original.CarOccurrencePhotos}
                hasDimensions={false}
              />
            ) : null}
          </Col>
        </Row>
      </>
    ),
    []
  );

  return (
    <>
      {' '}
      {console.log(cars)}
      <Loading isLoading={isLoading} />
      <EditModal // modal p/ pesquisa de materiais
        handleClose={handleCloseEditModal}
        show={showEditModal}
        data={dataModal}
        handleSave={handleSaveEditModal}
      />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Ocorrências Cadastrados</Card.Title>
          <Card.Text>Cadastros realizados no sisman.</Card.Text>
        </Row>

        <TableGfilterNestedrowHiddenRows
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
