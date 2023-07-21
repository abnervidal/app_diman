/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaInfo,
  FaPencilAlt,
  FaSearch,
  FaSearchPlus,
  FaSearchMinus,
} from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
  Badge,
  Dropdown,
  Form,
} from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../components/TableGfilterNestedRowHiddenRows';
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

// trigger to custom filter
function DefaultColumnFilter() {
  return <> </>;
} // as colunas padrao nao aplicam filtro

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
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
          >
            {filterValue ? <span>{filterValue}</span> : <FaSearch />}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
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

function InputColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
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
    <Row>
      <Col xs="auto" className="pe-0">
        <OverlayTrigger
          placement="left"
          delay={{ show: 250, hide: 400 }}
          overlay={(props) => renderTooltip(props, `Filter for ${id}`)}
        >
          <Button
            variant="outline-primary"
            size="sm"
            id="dropdown-group"
            className="border-0"
            onClick={(e) => {
              e.preventDefault();
              const searchInput = e.currentTarget.parentElement.nextSibling;

              if (searchInput.className.includes('d-none')) {
                searchInput.className = searchInput.className.replace(
                  'd-none',
                  'd-inline'
                );
              } else {
                searchInput.className = searchInput.className.replace(
                  'd-inline',
                  'd-none'
                );
                setFilter(undefined);
              }

              return true;
            }}
          >
            {!filterValue ? <FaSearchPlus /> : <FaSearchMinus />}
          </Button>
        </OverlayTrigger>
      </Col>
      <Col className="ps-1 d-none">
        <Form.Control
          type="text"
          size="sm"
          value={filterValue || ''}
          onChange={(e) => {
            setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
          }}
        />
      </Col>
    </Row>
  );
}
function InputDateColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
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
    <>
      <Row className="py-0 my-0">
        <Col xs="auto" className="pe-0 my-0 py-0">
          <OverlayTrigger
            placement="left"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => renderTooltip(props, `Filter for ${id}`)}
          >
            <Button
              variant="outline-primary"
              size="sm"
              id="dropdown-group"
              className="border-0"
              onClick={(e) => {
                e.preventDefault();
                const searchInputAfter =
                  e.currentTarget.parentElement.parentElement.nextSibling;
                const searchInputBefore =
                  e.currentTarget.parentElement.parentElement.nextSibling
                    .nextSibling;

                if (searchInputAfter.className.includes('d-none')) {
                  searchInputAfter.className =
                    searchInputAfter.className.replace('d-none', 'd-block');
                  searchInputBefore.className =
                    searchInputBefore.className.replace('d-none', 'd-block');
                } else {
                  searchInputAfter.className =
                    searchInputAfter.className.replace('d-block', 'd-none');
                  searchInputBefore.className =
                    searchInputBefore.className.replace('d-block', 'd-none');
                  setFilter(undefined);
                }

                return true;
              }}
            >
              {!filterValue ? <FaSearchPlus /> : <FaSearchMinus />}
            </Button>
          </OverlayTrigger>
        </Col>
      </Row>
      <Row className="d-none">
        <Col className="fw-normal">De:</Col>
        <Col xs={12}>
          <Form.Control
            type="date"
            size="sm"
            value={filterValue?.after || ''}
            onChange={(e) => {
              setFilter(
                { after: e.target.value, before: filterValue?.before } ||
                  undefined
              ); // Set undefined to remove the filter entirely
            }}
            style={{ width: '110px' }}
          />
        </Col>
      </Row>
      <Row className="d-none">
        <Col className="fw-normal">Até:</Col>
        <Col xs={12}>
          <Form.Control
            type="date"
            size="sm"
            value={filterValue?.before || ''}
            onChange={(e) => {
              setFilter(
                { after: filterValue?.after, before: e.target.value } ||
                  undefined
              ); // Set undefined to remove the filter entirely
            }}
            style={{ width: '110px' }}
          />
        </Col>
      </Row>
    </>
  );
}
function InputValueColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
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
    <>
      <Row className="py-0 my-0">
        <Col xs="auto" className="pe-0 my-0 py-0">
          <OverlayTrigger
            placement="left"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => renderTooltip(props, `Filter for ${id}`)}
          >
            <Button
              variant="outline-primary"
              size="sm"
              id="dropdown-group"
              className="border-0"
              onClick={(e) => {
                e.preventDefault();
                const searchInputAfter =
                  e.currentTarget.parentElement.parentElement.nextSibling;
                const searchInputBefore =
                  e.currentTarget.parentElement.parentElement.nextSibling
                    .nextSibling;

                if (searchInputAfter.className.includes('d-none')) {
                  searchInputAfter.className =
                    searchInputAfter.className.replace('d-none', 'd-block');
                  searchInputBefore.className =
                    searchInputBefore.className.replace('d-none', 'd-block');
                } else {
                  searchInputAfter.className =
                    searchInputAfter.className.replace('d-block', 'd-none');
                  searchInputBefore.className =
                    searchInputBefore.className.replace('d-block', 'd-none');
                  setFilter(undefined);
                }

                return true;
              }}
            >
              {!filterValue ? <FaSearchPlus /> : <FaSearchMinus />}
            </Button>
          </OverlayTrigger>
        </Col>
      </Row>
      <Row className="d-none">
        <Col className="fw-normal">Mín R$:</Col>
        <Col xs={12}>
          <Form.Control
            type="number"
            size="sm"
            value={filterValue?.after || ''}
            onChange={(e) => {
              setFilter(
                { after: e.target.value, before: filterValue?.before } ||
                  undefined
              ); // Set undefined to remove the filter entirely
            }}
            style={{ width: '110px' }}
            step="any"
          />
        </Col>
      </Row>
      <Row className="d-none">
        <Col className="fw-normal">Máx R$:</Col>
        <Col xs={12}>
          <Form.Control
            type="number"
            size="sm"
            value={filterValue?.before || ''}
            onChange={(e) => {
              setFilter(
                { after: filterValue?.after, before: e.target.value } ||
                  undefined
              ); // Set undefined to remove the filter entirely
            }}
            style={{ width: '110px' }}
            step="any"
          />
        </Col>
      </Row>
    </>
  );
}

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  async function getData(queryString) {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `/materials/itemsbyworkers${queryString}`
      );

      setData(response.data);
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
      // {
      //   Header: 'ID',
      //   accessor: 'id',
      //   width: 130,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   Filter: InputColumnFilter,
      //   filter: 'text',
      // },
      {
        Header: 'Nome',
        accessor: 'name',
        isVisible: window.innerWidth > 768,
      },
      // {
      //   Header: 'Descrição',
      //   accessor: 'name',
      //   disableSortBy: true,
      //   Filter: InputColumnFilter,
      //   filter: 'text',
      // },
      // {
      //   Header: 'Unidade',
      //   accessor: 'unit',
      //   width: 120,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   Filter: SelectColumnFilter,
      //   filter: 'includes',
      // },
      // {
      //   Header: 'Saída (Uso)',
      //   accessor: (originalRow) =>
      //     originalRow.Workers.reduce(
      //       (acc, current) => acc + current.materialsOutItemsTotal,
      //       0
      //     ),
      //   width: 120,
      //   disableResizing: true,
      //   disableSortBy: true,
      // },
      // {
      //   Header: 'Retorno',
      //   accessor: (originalRow) =>
      //     originalRow.Workers.reduce(
      //       (acc, current) => acc + current.materialsInItemsTotal,
      //       0
      //     ),
      //   width: 120,
      //   disableResizing: true,
      //   disableSortBy: true,
      // },
      // {
      //   Header: 'Uso efetivo',
      //   accessor: (originalRow) =>
      //     originalRow.Workers.reduce(
      //       (acc, current) => acc + current.materialsEffectiveItemsTotal,
      //       0
      //     ),
      //   width: 120,
      //   disableResizing: true,
      //   disableSortBy: true,
      // },
    ],
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
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
    pageSize: 50,
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
          ids.some((id, index) => {
            // console.log(row.original.MaterialOutItems, id);

            const rowValue = row.values[id];
            const arrayFilter = String(filterValue).split(' ');

            if (
              !index && // TESTAR SO NO 0 PARA ECONOMIZAR MEMORIA
              filterValue.substring(1, 0) === '*' && // PARA PESQUISAR NA SUBROW DO NOME DO MATERIAL TEM Q UTILIZAR O * NO INÍCIO DA CONSULTA SEGUIDO DE ESPAÇO
              row.original.MaterialInItems?.length > 0
            ) {
              const [, ...arrayFilterSub] = arrayFilter;
              const materials = row.original.MaterialInItems;

              return materials.reduce((ac, mat) => {
                // ac -> acumulador; mat -> material
                ac =
                  ac ||
                  arrayFilterSub.reduce((res, cur) => {
                    // res -> response; cur -> currency (atual)
                    res =
                      res &&
                      String(mat.name)
                        .toLowerCase()
                        .includes(String(cur).toLowerCase());
                    return res;
                  }, true);
                return ac;
              }, false);
            }

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

      rangeDate: (rows, ids, filterValue) => {
        rows = rows.filter((row) =>
          ids.some((id, index) => {
            const rowValue = row.values[id];

            // Date row
            const rowDate = rowValue.split('/');
            const day = Number(rowDate[0]);
            const month = Number(rowDate[1]) - 1;
            const year = Number(rowDate[2].substring(0, 4));
            const rowDateFormated = new Date(year, month, day);
            console.log(
              row.values[id],
              rowDateFormated,
              rowDateFormated.getTime()
            );

            // Date After
            let dateAfterFormated;
            if (filterValue.after) {
              const dateAfter = filterValue.after?.split('-');
              const dayAfter = Number(dateAfter[2]);
              const monthAfter = Number(dateAfter[1]) - 1;
              const yearAfter = Number(dateAfter[0].substring(0, 4));
              dateAfterFormated = new Date(yearAfter, monthAfter, dayAfter);
              console.log(
                filterValue.after,
                dateAfterFormated,
                dateAfterFormated.getTime()
              );
            }

            // Date Before
            let dateBeforeFormated;
            if (filterValue.before) {
              const dateBefore = filterValue.before?.split('-');
              const dayBefore = Number(dateBefore[2]);
              const monthBefore = Number(dateBefore[1]) - 1;
              const yearBefore = Number(dateBefore[0].substring(0, 4));
              dateBeforeFormated = new Date(yearBefore, monthBefore, dayBefore);
              console.log(
                filterValue.before,
                dateBeforeFormated,
                dateBeforeFormated.getTime()
              );
            }

            if (filterValue.after && filterValue.before)
              return (
                rowDateFormated.getTime() >= dateAfterFormated.getTime() &&
                rowDateFormated.getTime() <= dateBeforeFormated.getTime()
              );

            if (filterValue.after)
              return rowDateFormated.getTime() >= dateAfterFormated.getTime();

            if (filterValue.before)
              return rowDateFormated.getTime() <= dateBeforeFormated.getTime();

            return true;
          })
        );
        return rows;
      },

      rangeValue: (rows, ids, filterValue) => {
        rows = rows.filter((row) =>
          ids.some((id, index) => {
            const rowValue = row.values[id];

            // Value row
            let rowValueFormated;
            if (row.values[id]) {
              rowValueFormated = Number(
                rowValue.split(' ')[1].replace(',', '.')
              );
              console.log(row.values[id], rowValueFormated);
            }

            // Value After
            let valueAfterFormated;
            if (filterValue.after) {
              valueAfterFormated = Number(filterValue.after);
              console.log(filterValue.after, valueAfterFormated);
            }

            // Value Before
            let valueBeforeFormated;
            if (filterValue.before) {
              valueBeforeFormated = Number(filterValue.before);
              console.log(filterValue.before, valueBeforeFormated);
            }

            if (filterValue.after && filterValue.before)
              return (
                rowValueFormated >= valueAfterFormated &&
                rowValueFormated <= valueBeforeFormated
              );

            if (filterValue.after)
              return rowValueFormated >= valueAfterFormated;

            if (filterValue.before)
              return rowValueFormated <= valueBeforeFormated;

            return true;
          })
        );
        return rows;
      },
    }),
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <Row>
        <Col xs={6}>
          <div>
            <Badge className="text-white">USO</Badge>
          </div>{' '}
          <TableNestedrow
            style={{ padding: 0, margin: 0 }}
            columns={[
              // {
              //   // Make an expander cell
              //   Header: () => null, // No header
              //   id: 'expander', // It needs an ID
              //   width: 30,
              //   disableResizing: true,
              //   Cell: ({ row }) => (
              //     // Use Cell to render an expander for each row.
              //     // We can use the getToggleRowExpandedProps prop-getter
              //     // to build the expander.
              //     <span {...row.getToggleRowExpandedProps()}>
              //       {row.isExpanded ? '▽' : '▷'}
              //     </span>
              //   ),
              // },
              {
                Header: 'Data',
                accessor: (originalRow) => {
                  const dateString = originalRow.MaterialOut.created_at;
                  const date = new Date(dateString);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return formattedDate; // Output: 05/04/2023
                },
                width: 110,
                disableResizing: true,
              },
              {
                Header: 'Manutenção',
                accessor: (originalRow) =>
                  originalRow.MaterialOut.reqMaintenance,
                width: 120,
                disableResizing: true,
                disableSortBy: true,
              },
              {
                Header: 'Qtd',
                accessor: 'quantity',
                width: 70,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Unit.',
                accessor: 'value',
                width: 70,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Total',
                accessor: (originalRow) =>
                  (
                    Number(originalRow.quantity) * Number(originalRow.value)
                  ).toFixed(2),
                width: 80,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Local',
                accessor: (originalRow) => originalRow.MaterialOut.place,

                disableSortBy: true,
              },
              // {
              //   Header: 'Nome',
              //   accessor: 'name',
              //   isVisible: window.innerWidth > 768,
              // },
              // { Header: 'Denominação', accessor: 'name' },
              // {
              //   Header: 'Unidade',
              //   accessor: 'unit',
              //   width: 100,
              //   disableResizing: true,
              // },
              // {
              //   Header: 'Qtd',
              //   accessor: 'quantity',
              //   width: 100,
              //   disableResizing: true,
              // },
              // {
              //   Header: 'Valor',
              //   accessor: 'value',
              //   width: 100,
              //   disableResizing: true,
              //   // eslint-disable-next-line react/destructuring-assignment
              // },
            ]}
            data={row.original.materialsOutItems}
            defaultColumn={{
              // Let's set up our default Filter UI
              // Filter: DefaultColumnFilter,
              minWidth: 30,
              width: 50,
              maxWidth: 800,
            }}
            initialState={{
              // sortBy: [
              //   {
              //     id: 'MaterialId',
              //     asc: true,
              //   },
              // ],
              hiddenColumns: columns
                .filter((col) => col.isVisible === false)
                .map((col) => col.accessor),
            }}
            filterTypes={filterTypes}
            // renderRowSubComponent={renderRowSubSubComponent}
          />
        </Col>
        <Col xs={6}>
          <div>
            <Badge className="text-white">RETORNO</Badge>
          </div>{' '}
          <TableNestedrow
            style={{ padding: 0, margin: 0 }}
            columns={[
              // {
              //   // Make an expander cell
              //   Header: () => null, // No header
              //   id: 'expander', // It needs an ID
              //   width: 30,
              //   disableResizing: true,
              //   Cell: ({ row }) => (
              //     // Use Cell to render an expander for each row.
              //     // We can use the getToggleRowExpandedProps prop-getter
              //     // to build the expander.
              //     <span {...row.getToggleRowExpandedProps()}>
              //       {row.isExpanded ? '▽' : '▷'}
              //     </span>
              //   ),
              // },
              {
                Header: 'Data',
                accessor: (originalRow) => {
                  const dateString = originalRow.MaterialIn.created_at;
                  const date = new Date(dateString);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return formattedDate; // Output: 05/04/2023
                },
                width: 110,
                disableResizing: true,
              },
              {
                Header: 'Manutenção',
                accessor: (originalRow) =>
                  originalRow.MaterialIn.reqMaintenance,
                disableSortBy: true,
                width: 110,
                disableResizing: true,
              },
              {
                Header: 'Qtd',
                accessor: 'quantity',
                width: 70,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Unit.',
                accessor: 'value',
                width: 70,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Total',
                accessor: (originalRow) =>
                  (
                    Number(originalRow.quantity) * Number(originalRow.value)
                  ).toFixed(2),
                width: 80,
                disableResizing: true,
                isVisible: window.innerWidth > 768,
              },
              {
                Header: 'Local',
                accessor: (originalRow) =>
                  originalRow.MaterialIn.MaterialReturned.place,

                disableSortBy: true,
              },
              // {
              //   Header: 'Nome',
              //   accessor: 'name',
              //   isVisible: window.innerWidth > 768,
              // },
              // { Header: 'Denominação', accessor: 'name' },
              // {
              //   Header: 'Unidade',
              //   accessor: 'unit',
              //   width: 100,
              //   disableResizing: true,
              // },
              // {
              //   Header: 'Qtd',
              //   accessor: 'quantity',
              //   width: 100,
              //   disableResizing: true,
              // },
              // {
              //   Header: 'Valor',
              //   accessor: 'value',
              //   width: 100,
              //   disableResizing: true,
              //   // eslint-disable-next-line react/destructuring-assignment
              // },
            ]}
            data={row.original.materialsInItems}
            defaultColumn={{
              // Let's set up our default Filter UI
              // Filter: DefaultColumnFilter,
              minWidth: 30,
              width: 50,
              maxWidth: 800,
            }}
            initialState={{
              // sortBy: [
              //   {
              //     id: 'MaterialId',
              //     asc: true,
              //   },
              // ],
              hiddenColumns: columns
                .filter((col) => col.isVisible === false)
                .map((col) => col.accessor),
            }}
            filterTypes={filterTypes}
            // renderRowSubComponent={renderRowSubSubComponent}
          />
        </Col>
      </Row>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(({ row }) => {
    // const workerTotal = row.original.materialsOutItems.reduce(
    //   (accumulator, currentValue) => accumulator + Number(currentValue.value),
    //   0
    // );
    console.log(row);
    return (
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
          // {
          //   Header: 'WorkerId',
          //   accessor: 'WorkerId',
          //   width: 125,
          //   disableResizing: true,
          //   isVisible: window.innerWidth > 768,
          // },
          {
            Header: 'Nome',
            accessor: 'name',
            isVisible: window.innerWidth > 768,
          },
          {
            Header: 'Saída (Uso)',
            width: 125,
            disableResizing: true,
            accessor: 'materialsOutItemsTotal',
            isVisible: window.innerWidth > 768,
          },
          {
            Header: 'Retorno',
            width: 125,
            disableResizing: true,
            accessor: 'materialsInItemsTotal',
            isVisible: window.innerWidth > 768,
          },
          {
            Header: 'Uso Efetivo',
            width: 125,
            disableResizing: true,
            accessor: 'materialsEffectiveItemsTotal',
            isVisible: window.innerWidth > 768,
          },
          {
            Header: '% Retorno',
            width: 125,
            disableResizing: true,
            accessor: (originalRow) =>
              `${(
                (originalRow.materialsInItemsTotal * 100) /
                originalRow.materialsOutItemsTotal
              ).toFixed(2)} %`,
            isVisible: window.innerWidth > 768,
          },
          // {
          //   Header: 'Total',
          //   width: 125,
          //   disableResizing: true,
          //   accessor: () => workerTotal,
          //   isVisible: window.innerWidth > 768,
          // },
          // { Header: 'Denominação', accessor: 'name' },
          // {
          //   Header: 'Unidade',
          //   accessor: 'unit',
          //   width: 100,
          //   disableResizing: true,
          // },
          // {
          //   Header: 'Qtd',
          //   accessor: 'quantity',
          //   width: 100,
          //   disableResizing: true,
          // },
          // {
          //   Header: 'Valor',
          //   accessor: 'value',
          //   width: 100,
          //   disableResizing: true,
          //   // eslint-disable-next-line react/destructuring-assignment
          // },
        ]}
        data={row.original.Workers}
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
    );
  }, []);

  return (
    <>
      <Loading isLoading={isLoading} />
      <FilterDate getData={getData} />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>
            Relatório de Consumo: Material por Colaborador
          </Card.Title>
          <Card.Text>
            Usos e retornos referentes a todos os materiais por determinados
            colaboradores
          </Card.Text>
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
