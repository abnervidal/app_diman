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
import { Form, Table, Row, Col, Button } from 'react-bootstrap';
import {
  FaFilter,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSort,
} from 'react-icons/fa';

export function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const inputRef = useRef();
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  // eslint-disable-next-line no-shadow
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

export default function TableGfilterNestedrow({
  columns,
  data,
  defaultColumn,
  filterTypes,
  initialState,
  renderRowSubComponent,
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
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      globalFilter: 'text',
      filterTypes,
      initialState,
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
    <>
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

      <Row className="pt-3">
        <Table bordered hover size="sm" {...getTableProps()} responsive="sm">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {column.canSort ? (
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
                    ) : null}
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
                        className="py-3"
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
                        style={{
                          width: '100%',
                          borderColor: 'rgb(222,226,230)',
                          background: '#FFF',
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
    </>
  );
}
