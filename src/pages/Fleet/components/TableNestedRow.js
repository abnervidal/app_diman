/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  useTable,
  useSortBy,
  useFlexLayout,
  useResizeColumns,
  useExpanded,
} from 'react-table';
import { Table, Row } from 'react-bootstrap';
import { FaSortAlphaDown, FaSortAlphaUp, FaSort } from 'react-icons/fa';

export default function TableGfilterNestedrow({
  columns,
  data,
  defaultColumn,
  initialState,
  renderRowSubComponent,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
    state,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      globalFilter: 'text',
      initialState,
    },
    useSortBy,
    useFlexLayout,
    useResizeColumns,
    useExpanded
  );

  return (
    <Row>
      <Table bordered hover size="sm" {...getTableProps()} responsive="md">
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
          {rows.map((row) => {
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
                      style={{ width: '100%', borderColor: 'rgb(222,226,230)' }}
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
  );
}
