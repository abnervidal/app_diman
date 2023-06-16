/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React, { useRef } from 'react';
import {
  useTable,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  useFlexLayout,
  useResizeColumns,
  useExpanded,
  usePagination,
} from 'react-table';
import { Form, Table, Row, Col, Button, Badge } from 'react-bootstrap';
import {
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSort,
} from 'react-icons/fa';
import styled from 'styled-components';

const Styles = styled.div`
  table {
    table {
      background-color: #fff;
    }
  }
`;

export function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  globalFilteredRows,
  toggleAllRowsExpanded,
}) {
  const inputRef = useRef();
  const count = preGlobalFilteredRows.length;
  const countFiltered = globalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  // eslint-disable-next-line no-shadow
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Row>
        <Form.Group
          as={Col}
          className="d-flex align-items-center"
          controlId="searchForm"
        >
          <Form.Label column xs="auto" className="pe-2">
            <FaFilter className="text-dark" />
          </Form.Label>
          <Form.Control
            size="sm"
            type="text"
            value={value || ''}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              onChange(e.target.value);
            }}
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
            placeholder="Digite aqui sua consulta..."
            className="border-0"
            autoComplete="off"
            autoFocus
            ref={inputRef}
          />
        </Form.Group>
      </Row>
      <Row className="d-flex justify-content-end">
        <Col sm="auto">
          <Badge bg="ligth" text="dark" className="mt-1">
            {countFiltered} registros encontrados de {count}
          </Badge>
        </Col>
      </Row>
    </Form>
  );
}

function SortBy({ column: { isSorted, isSortedDesc, toggleSortBy } }) {
  return (
    <Col xs="auto" className="pe-0">
      <span>
        {' '}
        {isSorted ? (
          isSortedDesc ? (
            <Button
              title="Ordenado decrescente"
              size="sm"
              variant="outline-primary"
              className="border-0"
              onClick={() => toggleSortBy(!isSortedDesc)}
            >
              <FaSortAlphaUp />
            </Button>
          ) : (
            <Button
              title="Ordenado crescente"
              size="sm"
              variant="outline-primary"
              className="border-0 "
              onClick={() => toggleSortBy(!isSortedDesc)}
            >
              <FaSortAlphaDown />
            </Button>
          )
        ) : (
          <Button
            title="Clique para ordenar"
            size="sm"
            variant="outline-primary"
            className="border-0 "
            onClick={() => toggleSortBy(false)}
          >
            <FaSort />
          </Button>
        )}
      </span>
    </Col>
  );
}

export default function TableGfilterNestedRowHiddenRows({
  columns,
  data,
  defaultColumn,
  filterTypes,
  initialState,
  renderRowSubComponent,
  updateMyData,
  updateMyDataDatabase,
  skipPageReset,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    prepareRow,
    visibleColumns,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    globalFilteredRows,
    toggleAllRowsExpanded,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      globalFilter: 'text',
      filterTypes,
      autoResetFilters: !skipPageReset,
      autoResetGlobalFilter: !skipPageReset,
      autoResetSortBy: !skipPageReset,
      initialState,
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      updateMyDataDatabase,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useFlexLayout,
    useResizeColumns,
    useExpanded,
    usePagination
  );

  return (
    <Styles>
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
            globalFilteredRows={globalFilteredRows}
            toggleAllRowsExpanded={toggleAllRowsExpanded}
          />
        </Col>
      </Row>

      <Row className="py-3">
        <Table striped bordered size="sm" {...getTableProps()} responsive="md">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    className="text-center align-middle"
                    {...column.getHeaderProps()}
                  >
                    {column.render('Header')}
                    <Row className="text-center">
                      {column.canSort ? <SortBy column={column} /> : null}
                      {column.canFilter ? column.render('Filter') : null}
                    </Row>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <>
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td
                        className={`text-center py-3 ${
                          row.isExpanded ? 'bg-info text-white' : 'fw-normal'
                        }`}
                        style={{
                          verticalAlign: 'middle',
                        }}
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                  {/*
                    If the row is in an expanded state, render a row with a
                    column that fills the entire length of the table.
                  */}
                  {row.isExpanded ? (
                    <tr {...row.getRowProps()} className="border-0">
                      <td
                        colSpan={visibleColumns.length}
                        className="bg-info"
                        style={{
                          width: '100%',
                          borderColor: 'rgb(222,226,230)',
                          // background: '#FFF',
                        }}
                      >
                        {/*
                          Inside it, call our renderRowSubComponent function. In reality,
                          you could pass whatever you want as props to
                          a component like this, including the entire
                          table instance. But for this example, we'll just
                          pass the row
                        */}
                        {renderRowSubComponent({ row })}
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </Table>
      </Row>

      <Row className="d-flex align-items-center py-2">
        <Col xs="12" sm="auto" className="d-flex py-1">
          <div>
            <Button
              as={Col}
              xs="auto"
              variant="dark"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className="me-1"
            >
              {'<<'}
            </Button>{' '}
            <Button
              as={Col}
              xs="auto"
              variant="dark"
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="me-1"
            >
              {'<'}
            </Button>{' '}
            <Button
              as={Col}
              xs="auto"
              variant="dark"
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="me-1"
            >
              {'>'}
            </Button>{' '}
            <Button
              as={Col}
              xs="auto"
              variant="dark"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className="me-1"
            >
              {'>>'}
            </Button>{' '}
          </div>
        </Col>
        <Col xs="12" sm="auto" className="d-flex py-1">
          <span>
            Página{' '}
            <strong>
              {state.pageIndex + 1} de {pageOptions.length}
            </strong>
          </span>
        </Col>
        <Col xs="auto" className="d-none d-sm-flex align-items-center py-1">
          <span>Ir para página: </span>

          <Form.Group as={Col} className="d-flex">
            <Form.Control
              size="sm"
              type="number"
              defaultValue={state.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: '60px' }}
              className="text-center"
            />
          </Form.Group>
        </Col>
        <Form.Group as={Col} xs="auto" className="d-flex py-1">
          <Form.Select
            size="sm"
            value={state.pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Row>
    </Styles>
  );
}
