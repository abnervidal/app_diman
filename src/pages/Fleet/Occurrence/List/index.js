/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaImages } from 'react-icons/fa';

import { Container, Row, Card, Col, Badge, Button } from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedrow from '../../components/TableGfilterNestedRow';
import TableNestedrow from '../../components/TableNestedRow';
import GalleryComponent from '../../../../components/GalleryComponent';

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState([]);
  // const [carsOccurrences, setCarsOccurrences] = useState([]);

  useEffect(() => {
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
                {row.original.CarOccurrencePhotos.length > 0
                  ? getItems()
                  : null}
              </div>
            </>
          );
        },
      },
      {
        Header: 'Apelido',
        accessor: (originalRow) => originalRow.Car?.alias,
      },
      {
        Header: 'Marca',
        accessor: (originalRow) => originalRow.Car?.brand,
      },
      {
        Header: 'Modelo',
        accessor: (originalRow) => originalRow.Car?.model,
      },
      {
        Header: 'Placa',
        accessor: (originalRow) => originalRow.Car?.plate,
      },
      {
        Header: 'Categoria',
        accessor: (originalRow) => originalRow.Car.Cartype?.type,
      },
    ],
    []
  );

  const data = React.useMemo(() => cars, [cars]);
  // const data2 = React.useMemo(() => carsOccurrences, [carsOccurrences]);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      // Filter: DefaultColumnFilter,
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
            <Badge>OCORRÊNCIAS DO VEÍCULO</Badge>
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
                  Header: 'Motorista',
                  accessor: (originalRow) => originalRow.Worker?.name,
                },
                {
                  Header: 'Tipo de Ocorrência',
                  accessor: (originalRow) =>
                    originalRow.CarOccurrencetype?.type,
                },
                {
                  Header: 'Data da Ocorrência',
                  accessor: 'data',
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
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Automóveis Cadastrados</Card.Title>
          <Card.Text>Cadastros realizados no sisman.</Card.Text>
        </Row>

        <TableGfilterNestedrow
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
