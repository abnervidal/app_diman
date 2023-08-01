/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { FaLockOpen, FaLock, FaSearch } from 'react-icons/fa';

import {
  Container,
  Col,
  Row,
  Card,
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import ReleaseItemsModal from './components/ReleaseItemsModal';
import RestrictItemsModal from './components/RestrictItemsModal';

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

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

// trigger to custom filter
function DefaultColumnFilter() {
  return <> </>;
} // as colunas padrao nao aplicam filtro

// This is a custom filter UI for selecting
// a unique option from a list
const FilterForRestrict = ({
  column: { filterValue, preFilteredRows, setFilter, id },
}) =>
  React.useMemo(
    () => (
      <div>
        {filterValue === 1 ? (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) =>
              renderTooltip(
                props,
                'Clique para mostrar requisições com alguma restrição'
              )
            }
          >
            <Button size="sm" variant="outline-primary" className="border-0">
              <FaLock cursor="pointer" onClick={() => setFilter(0)} />
            </Button>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) =>
              renderTooltip(
                props,
                'Clique para mostrar requisições totalmente liberadas'
              )
            }
          >
            <Button size="sm" variant="outline-primary" className="border-0">
              <FaLockOpen cursor="pointer" onClick={() => setFilter(1)} />
            </Button>
          </OverlayTrigger>
        )}
      </div>
    ),
    [filterValue, setFilter]
  );

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [showModalRel, setShowModalRel] = useState(false);
  const [showModalRes, setShowModalRes] = useState(false);
  const [reqInModal, setReqInModal] = useState('');

  async function getData(values) {
    try {
      setIsLoading(true);
      const queryString = objectToQueryString(values);

      const response = await axios.get(`/materials/in/rl?${queryString}`);
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
    setShowModalRel(false);
    setShowModalRes(false);
  };

  const handleCloseModalRel = () => {
    setShowModalRel(false);
    getData();
  };
  const handleCloseModalRes = () => {
    setShowModalRes(false);
    getData();
  };

  const handleShowModalRel = (reqIn) => {
    setReqInModal(reqIn);
    setShowModalRel(true);
  };
  const handleShowModalRes = (reqIn) => {
    setReqInModal(reqIn);
    setShowModalRes(true);
  };

  const columns = React.useMemo(
    () => [
      {
        // Make an expander cell
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
        Header: 'Nº RM',
        accessor: 'req',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        // disableFilters: true,
      },
      {
        Header: 'Req. Man.',
        accessor: 'reqMaintenance',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
      },
      {
        Header: 'Tipo',
        accessor: 'type',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
      },
      {
        Header: 'Recebimento',
        accessor: 'createdAt',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
      },
      {
        Header: 'Usuário Pedido',
        accessor: 'requiredBy',
        width: 150,
        disableResizing: true,
        disableSortBy: true,
        Cell: (props) => {
          const custom = String(props.value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableFilters: true,
      },
      {
        Header: 'Pedido',
        accessor: 'registerDate',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
      },

      {
        Header: 'Unidade de Custo',
        accessor: 'costUnit',
        isVisible: window.innerWidth > 768,
        disableSortBy: true,
        // eslint-disable-next-line react/destructuring-assignment
        Cell: (props) => {
          const custom = String(props.value).replace(/([0-9]{2})/gm, '$1.');
          return (
            <span title={props.row.original.costUnitNome}>
              {custom} {props.row.original.costUnitSigla}
            </span>
          );
        },
        disableFilters: true,
      },
      {
        Header: 'Valor',
        accessor: 'value',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
      },
      {
        Header: () => (
          // FORMAT HEADER
          <div className="p-auto text-center">Total</div>
        ),
        id: 'total',
        width: 100,
        disableResizing: true,
        disableSortBy: true,
        // disableFilters: true,
        defaultCanFilter: true,
        Filter: FilterForRestrict,
        filter: 'groupRestrict',
        Cell: ({ value, row }) => (
          <Row>
            {' '}
            <Col className="p-auto text-end">
              {value}{' '}
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) =>
                  renderTooltip(props, 'Realizar nova restrição')
                }
              >
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="border-0"
                  onClick={() => handleShowModalRes(row.original)}
                >
                  <FaLock />
                </Button>
              </OverlayTrigger>
            </Col>
            <Col className="p-auto text-end">
              {value}{' '}
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) =>
                  renderTooltip(props, 'Realizar nova liberação')
                }
              >
                <Button
                  size="sm"
                  variant="outline-success"
                  className="border-0"
                  onClick={() => handleShowModalRel(row.original)}
                >
                  <FaLockOpen />
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
      Filter: DefaultColumnFilter, // coloca filtro para todas as colunas
      minWidth: 30,
      width: 120,
      maxWidth: 800,
    }),
    []
  );

  const initialState = {
    // sortBy: [
    //   {
    //     id: 'req',
    //     desc: true,
    //   },
    // ],
    filters: [{ id: 'total', value: 0 }],
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
              row.original.MaterialRestricts[0]?.MaterialRestrictItems?.length >
                0
            ) {
              const [, ...arrayFilterSub] = arrayFilter;
              const materials =
                row.original.MaterialRestricts[0]?.MaterialRestrictItems;

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

      groupRestrict: (rows, ids, filterValue) => {
        rows = rows.filter((row) => {
          const quantityTotalRestrict = row.original.MaterialRestricts.reduce(
            (ac, value) => {
              ac += value.MaterialRestrictItems.reduce(
                (acItems, valueItems) => {
                  acItems += valueItems.quantity;
                  return acItems;
                },
                0
              );
              return ac;
            },
            0
          );
          const quantityTotalRelease = row.original.MaterialReleases.reduce(
            (ac, value) => {
              // eslint-disable-next-line no-unsafe-optional-chaining
              ac += value.MaterialReleaseItems?.reduce(
                (acItems, valueItems) => {
                  acItems += valueItems.quantity;
                  return acItems;
                },
                0
              );
              return ac;
            },
            0
          );
          if (filterValue)
            return quantityTotalRestrict === quantityTotalRelease;
          return quantityTotalRestrict !== quantityTotalRelease;
        });
        return rows;
      },
    }),
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <TableNestedrow
        style={{ padding: 0, margin: 0 }}
        columns={[
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
        data={
          row.original.MaterialRestrictItems ??
          row.original.MaterialReleaseItems
        }
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

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <Row>
          <Col className="fw-bold" style={{ fontSize: '.75em' }}>
            RESTRIÇÕES
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
              disableSortBy: true,
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
              // Make an expander cell
              Header: 'ID', // No header
              accessor: 'id', // It needs an ID
              width: 50,
              disableResizing: true,
              disableSortBy: true,
            },
            {
              Header: 'Usuário',
              accessor: 'userName',
              width: 125,
              disableResizing: true,
              disableSortBy: true,
              isVisible: window.innerWidth > 768,
            },
            {
              Header: 'Data',
              accessor: 'createdAt',
              width: 100,
              disableResizing: true,
              disableSortBy: true,
            },
          ]}
          data={row.original.MaterialRestricts}
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
        <Row>
          <Col className="fw-bold" style={{ fontSize: '.75em' }}>
            LIBERAÇÕES
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
              disableSortBy: true,
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
              // Make an expander cell
              Header: 'ID', // No header
              accessor: 'id', // It needs an ID
              width: 50,
              disableResizing: true,
              disableSortBy: true,
            },
            {
              Header: 'Usuário',
              accessor: 'userName',
              width: 125,
              disableResizing: true,
              disableSortBy: true,
              isVisible: window.innerWidth > 768,
            },
            {
              Header: 'Data',
              accessor: 'createdAt',
              width: 100,
              disableResizing: true,
              disableSortBy: true,
            },
          ]}
          data={row.original.MaterialReleases}
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
      </>
    ),
    []
  );

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <FilterDate getData={getData} />
        <ReleaseItemsModal // modal p/ liberação de materiais
          handleCancelModal={handleCancelModal}
          handleClose={handleCloseModalRel}
          show={showModalRel}
          data={reqInModal}
        />
        <RestrictItemsModal // modal p/ restricão de materiais
          handleCancelModal={handleCancelModal}
          handleClose={handleCloseModalRes}
          show={showModalRes}
          data={reqInModal}
        />
        <Row className="text-center py-3">
          <Card.Title>
            Operações de Restrições e Liberações: Materiais
          </Card.Title>
          <Card.Text>Materiais vinculados a RM ou Retorno.</Card.Text>
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
