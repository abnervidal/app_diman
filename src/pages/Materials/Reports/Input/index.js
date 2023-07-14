/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaCommentDots,
  FaInfo,
  FaDirections,
  FaPencilAlt,
  FaRedoAlt,
  FaSearch,
  FaSearchPlus,
  FaSearchMinus,
  FaSyncAlt,
  FaRegEdit,
  FaEdit,
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
  const [reqs, setReqs] = useState([]);

  async function getData(values) {
    try {
      setIsLoading(true);
      const queryString = objectToQueryString(values);

      const response = await axios.get(`/materials/in?${queryString}`);
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
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Nº RM',
        accessor: 'req',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: () => <div className="p-auto text-center">Tipo</div>,
        accessor: 'type',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value }) => {
          switch (value) {
            case 'RM AUTO':
              return <Badge bg="success">{value}</Badge>;
            case 'RETORNO':
              return <Badge bg="secondary">{value}</Badge>;
            case 'FORNECEDOR':
              return <Badge bg="warning">{value}</Badge>;
            case 'DOACAO':
              return <Badge bg="info">{value}</Badge>;
            default:
              return <Badge>{value}</Badge>;
          }
        },
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: () => <div className="p-auto text-center">Recebimento</div>,
        accessor: 'createdAt',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value }) => <div className="p-auto text-center">{value}</div>,
        Filter: InputDateColumnFilter,
        filter: 'rangeDate',
      },
      {
        Header: () => <div className="p-auto text-center">Conferente</div>,
        id: 'receivedBy',
        accessor: (originalRow) =>
          originalRow.receivedBy?.replace(/(^[a-z]*)\.([a-z]*).*/gm, '$1.$2'), // deixar só os dois primeiros nomes
        width: 150,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value }) => <div className="p-auto text-center">{value}</div>,
        Filter: SelectColumnFilter,
        filter: 'exactText',
      },
      {
        Header: () => <div className="p-auto text-center">Usuário Pedido</div>,
        id: 'requiredBy',
        accessor: (originalRow) =>
          originalRow.requiredBy?.replace(/(^[a-z]*)\.([a-z]*).*/gm, '$1.$2'), // deixar só os dois primeiros nomes
        width: 150,
        disableResizing: true,
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
      },
      {
        Header: () => <div className="p-auto text-center">Data pedido</div>,
        accessor: 'registerDate',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value }) => <div className="p-auto text-center">{value}</div>,
        Filter: InputDateColumnFilter,
        filter: 'rangeDate',
      },

      {
        Header: () => <div className="p-auto text-center">Unidade Custo</div>,
        accessor: 'costUnit',
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
        Cell: (props) => {
          const custom = String(props.value).replace(/([0-9]{2})/gm, '$1.');
          return props.value ? (
            <span title={props.row.original.costUnitNome}>
              {custom} {props.row.original.costUnitSigla}
            </span>
          ) : null;
        },
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Valor',
        accessor: 'value',
        width: 120,
        disableResizing: true,
        Cell: ({ value }) => <div className="p-auto text-end">{value}</div>,
        Filter: InputValueColumnFilter,
        // disableSortBy: true,
        filter: 'rangeValue',
      },
      {
        Header: () => <div className="p-auto text-center">Ações</div>,
        id: 'actions',
        width: 70,
        disableResizing: true,
        Cell: ({ value, row }) => (
          <Row className="d-flex flex-nowrap">
            <Col xs="auto" className="text-center m-0 p-0 px-1 ps-2">
              {row.original.obs ? (
                <>
                  {' '}
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => renderTooltip(props, row.original.obs)}
                  >
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="border-0 m-0"
                    >
                      <FaInfo />
                    </Button>
                  </OverlayTrigger>
                </>
              ) : null}
            </Col>
            <Col xs="auto" className="text-center m-0 p-0 px-1">
              <OverlayTrigger
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Editar entrada')}
              >
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="border-0 m-0"
                  onClick={() => {
                    alert('Funcionalidade em implantação...');
                  }}
                >
                  <FaPencilAlt />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => reqs, [reqs]);

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

              // return arrayFilterSub.reduce((res, cur) => {
              //   // res -> response; cur -> currency (atual)
              //   res =
              //     res &&
              //     String(materials[0].name)
              //       .toLowerCase()
              //       .includes(String(cur).toLowerCase());
              //   return res;
              // }, true);

              // return true;
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
      <>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
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
    ),
    []
  );

  return (
    <>
      <Loading isLoading={isLoading} />
      <FilterDate getData={getData} />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Relatório de Entrada: Materiais</Card.Title>
          <Card.Text>
            Materiais com entrada registrada por SIPAC, Doação, Retorno, etc.
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
