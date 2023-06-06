/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaReply } from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Button,
  Col,
  OverlayTrigger,
  Tooltip,
  Badge,
} from 'react-bootstrap';

import ReturnItemsModal from './components/ReturnItemsModal';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedrow from '../../components/TableGfilterNestedRow';
import TableNestedrow from '../../components/TableNestedRow';

import FilterDate from './components/FilterDate';

function objectToQueryString(obj) {
  const queryString = Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(
            (val) => `${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`
          )
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return queryString;
}

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [showModalReturn, setShowModalReturn] = useState(false);
  const [reqInModal, setReqInModal] = useState('');

  async function getData(values) {
    try {
      setIsLoading(true);
      const queryString = objectToQueryString(values);

      const response = await axios.get(`/materials/out?${queryString}`);
      setReqs(response.data);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  }

  // useEffect(() => {
  //   getData();
  // }, []);

  const handleCancelModal = () => {
    setShowModalReturn(false);
  };

  const handleCloseModalReturn = () => {
    setShowModalReturn(false);
    getData();
  };

  const handleShowModalReturn = (reqIn) => {
    setReqInModal(reqIn);
    setShowModalReturn(true);
  };

  const data = React.useMemo(() => reqs, [reqs]);

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
        Header: 'Req. Man.',
        accessor: 'reqMaintenance',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
      },
      {
        Header: 'Tipo',
        accessor: 'type',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value }) => {
          switch (value) {
            case 'USO':
              return <Badge bg="success">{value}</Badge>;
            case 'EMPRÉSTIMO':
              return <Badge bg="secondary">{value}</Badge>;
            case 'DESCARTE':
              return <Badge bg="warning">{value}</Badge>;
            case 'DOAÇÃO':
              return <Badge bg="info">{value}</Badge>;
            case 'DEVOLUÇÃO':
              return <Badge bg="dark">{value}</Badge>;
            case 'EXTRAVIO':
              return <Badge bg="danger">{value}</Badge>;
            default:
              return <Badge>{value}</Badge>;
          }
        },
      },
      {
        Header: 'Retira',
        accessor: 'createdAtBr',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
      },
      {
        Header: 'Autorização',
        accessor: 'authorizerUsername',
        width: 150,
        disableResizing: true,
        Cell: (props) => {
          const custom = String(props.value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
      },
      {
        Header: 'Profissional',
        accessor: 'removedBy',
        width: 200,
        disableResizing: true,
        Cell: (props) => {
          const custom = String(props.value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
      },
      {
        Header: 'Local',
        accessor: 'place',
        disableSortBy: true,
      },
      {
        Header: 'Valor',
        accessor: 'valueBr',
        width: 120,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        Cell: ({ value }) => <div className="text-end">{value}</div>,
      },
      {
        Header: 'Retornos',
        accessor: (originalRow) => originalRow.MaterialReturned.length,
        width: 100,
        disableResizing: true,
        disableSortBy: true,
      },
      {
        Header: () => null,
        id: 'return',
        width: 40,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <Row>
            {' '}
            <Col className="p-auto text-end">
              {value}{' '}
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) =>
                  renderTooltip(props, 'Retornar materiais para almoxarifado')
                }
              >
                <Button
                  size="sm"
                  variant="outline-success"
                  className="border-0"
                  onClick={() => {
                    handleShowModalReturn(row.original);
                    console.log(row.original);
                  }}
                >
                  <FaReply />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        ),
      },
    ],
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </>
    ),
    []
  );

  const renderRowSubSub1Component = React.useCallback(
    ({ row }) => (
      <TableNestedrow
        style={{ padding: 0, margin: 0 }}
        columns={[
          {
            // Make an expander cell
            Header: () => null, // No header
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
            accessor: 'materialId',
            width: 125,
            disableResizing: true,
            isVisible: window.innerWidth > 768,
          },
          { Header: 'Denominação', accessor: 'name' },
          {
            Header: 'Unidade',
            accessor: 'unit',
            width: 100,
            disableResizing: true,
          },
          {
            Header: 'Qtd',
            accessor: 'quantity',
            width: 100,
            disableResizing: true,
          },
          {
            Header: 'Valor',
            accessor: 'value',
            width: 100,
            disableResizing: true,
            // eslint-disable-next-line react/destructuring-assignment
          },
        ]}
        data={row.original.MaterialInItems}
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
              id: 'id',
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
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <br />
        <Row>
          <Col className="text-center">
            <span className="text-center fw-bold">SAÍDA:</span>
          </Col>
        </Row>
        <TableNestedrow
          style={{ padding: 0, margin: 0 }}
          columns={[
            {
              // Make an expander cell
              Header: () => null, // No header
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
              accessor: 'materialId',
              width: 125,
              disableResizing: true,
              isVisible: window.innerWidth > 768,
            },
            { Header: 'Denominação', accessor: 'name' },
            {
              Header: 'Unidade',
              accessor: 'unit',
              width: 100,
              disableResizing: true,
            },
            {
              Header: 'Qtd',
              accessor: 'quantity',
              width: 100,
              disableResizing: true,
            },
            {
              Header: 'Valor',
              accessor: 'value',
              width: 100,
              disableResizing: true,
              // eslint-disable-next-line react/destructuring-assignment
            },
          ]}
          data={row.original.MaterialOutItems}
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

        {row.original.MaterialReturned.length ? (
          <>
            <br />
            <Row>
              <Col className="text-center">
                <span className="text-center fw-bold">RETORNOS:</span>
              </Col>
            </Row>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={[
                {
                  // Make an expander cell
                  Header: () => null, // No header
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
                  Header: 'Retorno em:',
                  accessor: 'createdAtBr',
                  width: 160,
                  disableResizing: true,
                },
                {
                  Header: 'Valor',
                  accessor: 'valueBr',
                  width: 120,
                  disableResizing: true,
                },
                // {
                //   Header: 'Receb. por:',
                //   accessor: 'receivedBy',
                //   width: 150,
                //   disableResizing: true,
                //   Cell: (props) => {
                //     const custom = String(props.value).replace(
                //       /(^[a-z]*)\.([a-z]*).*/gm,
                //       '$1.$2'
                //     ); // deixar só os dois primeiros nomes
                //     return <span> {custom}</span>;
                //   },
                // },
                // {
                //   Header: 'Unidade de Custo',
                //   accessor: 'costUnit',
                //   isVisible: window.innerWidth > 768,
                //   // eslint-disable-next-line react/destructuring-assignment
                //   Cell: (props) => {
                //     const custom = String(props.value).replace(
                //       /([0-9]{2})/gm,
                //       '$1.'
                //     );
                //     return props.value ? (
                //       <span title={props.row.original.costUnitNome}>
                //         {custom} {props.row.original.costUnitSigla}
                //       </span>
                //     ) : null;
                //   },
                // },
              ]}
              data={row.original.MaterialReturned}
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
              renderRowSubComponent={renderRowSubSub1Component}
            />
          </>
        ) : null}
      </>
    ),
    []
  );

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
    // sortBy: [
    //   {
    //     id: 'id',
    //     desc: true,
    //   },
    // ],
    hiddenColumns: columns
      .filter((col) => col.isVisible === false)
      .map((col) => col.accessor),
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

  return (
    <>
      <Loading isLoading={isLoading} />
      <ReturnItemsModal // modal p/ restricão de materiais
        handleCancelModal={handleCancelModal}
        handleClose={handleCloseModalReturn}
        show={showModalReturn}
        data={reqInModal}
      />
      <Container>
        <FilterDate getData={getData} />
        <Row className="text-center py-3">
          <Card.Title>Retorno de Materiais</Card.Title>
          <Card.Text>
            Selecione um registro de saída para realizar o retorno.
          </Card.Text>
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
