/* eslint-disable no-nested-ternary */
import React, { useRef, useState, useEffect } from 'react';
import {
  useTable,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from 'react-table';
import { Container, Form, Table, Row, Col, Card } from 'react-bootstrap';
import {
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSort,
} from 'react-icons/fa';

import data3024 from '../../../../assets/JSON/materials3024JSON.json';
import data3026 from '../../../../assets/JSON/materials3026JSON.json';

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const inputRef = useRef();
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Form.Group
        as={Row}
        className="d-flex align-items-center"
        controlId="searchForm"
      >
        <Form.Label column xs="auto" className="pe-0">
          <FaFilter className="text-dark" />
        </Form.Label>
        <Col>
          <Form.Control
            size="sm"
            type="text"
            value={value || ''}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              onChange(e.target.value);
            }}
            placeholder={` ${count} registros...`}
            className="border-0"
            autoComplete="off"
            autoFocus
            ref={inputRef}
          />
        </Col>
      </Form.Group>
    </Form>
  );
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

export default function index() {
  const dataset = [...data3024.sipac, ...data3026.sipac];

  const data = React.useMemo(() => dataset, []);

  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'id_sipac' },
      { Header: 'Denominação', accessor: 'name' },
      { Header: 'Unidade', accessor: 'unit' },
    ],
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        sortBy: [
          {
            id: 'name',
            asc: true,
          },
        ],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return (
    <Container>
      <Row className="text-center py-3">
        <Card.Title>Materiais Cadastrados</Card.Title>
        <Card.Text>
          Referências extraídas via SIPAC (grupos: 3024, 3026).
        </Card.Text>
      </Row>

      <Row className="justify-content-center">
        <Col
          xs={10}
          sm={8}
          md={6}
          className="bg-light py-3 px-3 border rounded"
        >
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </Col>
      </Row>
      <Row className="py-3">
        <Table
          striped
          bordered
          hover
          size="sm"
          {...getTableProps()}
          responsive="sm"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {' '}
                      <FaSort />
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <FaSortAlphaUp />
                        ) : (
                          <FaSortAlphaDown />
                        )
                      ) : (
                        ''
                      )}
                    </span>
                    {/* <div> //FILTRO REMOVIDO
                      {column.canFilter ? column.render('Filter') : null}
                    </div> */}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      className="py-3"
                      style={{ verticalAlign: 'middle' }}
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
}
