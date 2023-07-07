/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaExclamation,
  FaInfo,
  FaTimes,
  FaPencilAlt,
  FaLock,
  FaLockOpen,
  FaSearch,
} from 'react-icons/fa';

import {
  Row,
  Col,
  Card,
  Button,
  OverlayTrigger,
  Tooltip,
  Badge,
  Dropdown,
} from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

import EditModal from './components/EditModal';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../components/TableNestedRow';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

// trigger to custom filter
function DefaultColumnFilter() {
  return <> teste </>;
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

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilterStatus({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(
    () => ['EM ESPERA', 'SEPARADA', 'UTILIZADA', 'CANCELADA'],
    []
  );

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

  // Render a multi-select box
  return (
    <Col>
      <OverlayTrigger
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={(props) => renderTooltip(props, 'Filtragem por status')}
      >
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            size="sm"
            id="dropdown-group"
            className="border-0"
          >
            <FaSearch /> {filterValue}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                setFilter('');
              }}
            >
              Remover Filtro
            </Dropdown.Item>
            {options.map((option, i) => (
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

// Define a custom filter filter function! Usar quando tiver tudo redondo, estoque e entradas. Por enquanto vou mostrar saldo negativo
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = Number(row.values[id]);
    if (filterValue === 1) return rowValue !== 0; // fiz esse ajuste para mostrar saldo negativo também, ficou estranho filterGreatherThan, podia ser outro nome, mas deixa assim por enquanto
    return true;
  });
}

const FilterForTotal = ({
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
              renderTooltip(props, 'Clique para mostrar materiais sem saldo')
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
                'Clique para não mostrar materiais sem saldo'
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
  const userId = useSelector((state) => state.auth.user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [reserves, setReserves] = useState([]);
  const inputRef = useRef();
  const [showEditModal, setShowEditModal] = useState(false);
  const [dataModal, setDataModal] = useState('');

  async function getReservesData() {
    try {
      setIsLoading(true);
      const response = await axios.get('/materials/reserve');
      setReserves(response.data);
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
    getReservesData();
  };
  const handleShowEditModal = (data) => {
    setDataModal(data);
    setShowEditModal(true);
  };

  useEffect(() => {
    // Focus on inputRef
    if (inputRef.current) {
      inputRef.current.focus();
    }

    getReservesData();
  }, []);

  const handleUpdateSeparetedAt = async (values) => {
    const { id: materialReserveId } = values;
    const updateSeparation = {
      separatedAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO DA SEPARAÇÃO
      await axios.put(
        `/materials/reserve/${materialReserveId}`,
        updateSeparation
      );

      setIsLoading(false);
      getReservesData();

      toast.success(`Separação realizada com sucesso`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const handleCancelAsk = (e, values) => {
    e.preventDefault();
    if (userId !== values.userId)
      return toast.error(
        `Reserva só pode ser cancelada pelo usuário que a criou.`
      );
    const exclamation = e.currentTarget.nextSibling;
    exclamation.className = exclamation.className.replace('d-none', 'd-inline');
    e.currentTarget.className += ' d-none';
    return true;

    // e.currentTarget.remove();
  };

  const handleCancelReserve = async (values) => {
    const updateCanceledAt = {
      canceledAt: new Date().toISOString(),
    };

    const formattedValues = {
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    delete Object.assign(formattedValues, {
      materialReserveId: formattedValues.id,
    }).id; // id de saída gerado automaticamente, se deixar vai usar o id da reserva

    formattedValues.MaterialReserveItems.forEach((item) => {
      delete Object.assign(item, { MaterialId: item.materialId }).materialId; // rename key
      item.value = item.value
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9\.]+/g, '');
    });

    try {
      setIsLoading(true);

      // ATUALIZAR QUANTIDADES DO INVENTARIO
      for (const item of formattedValues.MaterialReserveItems) {
        const response = await axios.get(
          `/materials/inventory/${item.MaterialId}`
        );
        const { releaseInventory, reserveInventory } = response.data;
        const updateInventory = {
          releaseInventory: Number(releaseInventory) + Number(item.quantity),
          reserveInventory: Number(reserveInventory) - Number(item.quantity),
        };

        await axios.put(
          `/materials/inventory/${item.MaterialId}`,
          updateInventory
        );
      }

      // ATUALIZA DATA DE CANCELAMENTO DA RESERVA
      await axios.put(
        `/materials/reserve/${formattedValues.materialReserveId}`,
        updateCanceledAt
      );

      setIsLoading(false);
      getReservesData();

      return toast.info(`Cancelamento de reserva realizado`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

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
        disableFilters: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Previsão',
        accessor: 'intendedUseBr',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        disableFilters: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Reservado por',
        accessor: 'userUsername',
        width: 140,
        disableResizing: true,
        Cell: ({ value }) => {
          const custom = String(value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Reserva para',
        accessor: 'workerName',
        disableSortBy: true,
        disableFilters: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Autorização',
        accessor: 'authorizerUsername',
        width: 140,
        disableResizing: true,
        Cell: ({ value }) => {
          const custom = String(value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },

      {
        Header: 'Valor',
        accessor: 'valueBr',
        width: 120,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        disableFilters: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Local',
        accessor: 'place',
        width: 150,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        disableSortBy: true,
        disableFilters: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Status',
        id: 'status',
        width: 140,
        disableResizing: true,
        Cell: ({ row }) => (
          <Row>
            <Col className="p-auto text-center">
              {row.original?.withdrawnAtBr ? (
                <>
                  <Badge bg="success">UTILIZADA</Badge>
                  {row.original?.withdrawnAtBr}
                </>
              ) : (
                <>
                  {row.original?.canceledAtBr ? (
                    <>
                      <Badge bg="danger">CANCELADA</Badge>
                      {row.original?.canceledAtBr}
                    </>
                  ) : (
                    <>
                      {' '}
                      {row.original?.separatedAtBr ? (
                        <>
                          <Badge bg="primary">SEPARADA</Badge>
                          {row.original?.separatedAtBr}
                        </>
                      ) : (
                        <Badge bg="secondary">EM ESPERA</Badge>
                      )}{' '}
                    </>
                  )}{' '}
                </>
              )}
            </Col>
          </Row>
        ),
        defaultCanFilter: true,
        Filter: SelectColumnFilterStatus,
        filter: 'groupStatus',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Ações',
        id: 'actions',
        width: 110,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        Cell: ({ row }) => (
          <Row className="d-flex flex-nowrap">
            <Col xs="auto" className="text-center m-0 p-0 px-1 ps-2">
              {row.original.obs ? (
                <>
                  {' '}
                  <OverlayTrigger
                    placement="top"
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
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Editar reserva')}
              >
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="border-0 m-0"
                  onClick={() => {
                    if (
                      userId !== row.original.authorizedBy &&
                      userId !== row.original.userId
                    ) {
                      return toast.error(
                        `Reserva só pode ser editada pelo criador ou autorizador.`
                      );
                    }
                    return handleShowEditModal(row.original);
                  }}
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
            <Col xs="auto" className="text-center m-0 p-0 px-1">
              <>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) => renderTooltip(props, 'Cancelar reserva')}
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
                    onClick={() => {
                      handleCancelReserve(row.original);
                    }}
                  >
                    <FaExclamation />
                  </Button>
                </OverlayTrigger>
              </>
            </Col>
          </Row>
        ),
      },
      {
        Header: () => (
          // FORMAT HEADER
          <div className="p-auto text-center">
            Requisição - Previsão - Status
          </div>
        ),
        id: 'mobile',
        width: 100,
        disableResizing: false,
        isVisible: window.innerWidth < 768,
        Cell: ({ value, row }) => (
          <div
          // onTouchMove={(e) => {
          //   // verifica se arrastou suficiente para a direita
          //   if (e.touches[0].clientX < 300) return;
          //   handlePushItem(e, row);
          // }}
          >
            <Row className="d-flex justify-content-between">
              <Col xs="auto" className="p-auto text-start">
                <Badge bg="light" text="dark">
                  {row.values.reqMaintenance}
                </Badge>
              </Col>
              <Col xs="auto" className="p-auto text-start">
                <Badge bg="light" text="dark">
                  {row.values.intendedUseBr} {row.values.userUsername}
                </Badge>
              </Col>
            </Row>
            <Row>
              <Col className="p-auto text-start">{row.values.workerName}</Col>
            </Row>
            <Row>
              <Col className="p-auto text-start">
                {row.original?.withdrawnAtBr ? (
                  <>
                    <Badge bg="success">UTILIZADA</Badge>{' '}
                    {row.original?.withdrawnAtBr}
                  </>
                ) : (
                  <>
                    {row.original?.canceledAtBr ? (
                      <>
                        <Badge bg="danger">CANCELADA</Badge>{' '}
                        {row.original?.canceledAtBr}
                      </>
                    ) : (
                      <>
                        {' '}
                        {row.original?.separatedAtBr ? (
                          <>
                            <Badge bg="primary">SEPARADA</Badge>{' '}
                            {row.original?.separatedAtBr}
                          </>
                        ) : (
                          <Badge bg="secondary">EM ESPERA</Badge>
                        )}{' '}
                      </>
                    )}{' '}
                  </>
                )}
              </Col>
            </Row>
          </div>
        ),
        disableSortBy: true,
        defaultCanFilter: true,
        Filter: SelectColumnFilterStatus,
        filter: 'groupStatus',
      },
    ],
    []
  );

  const data = React.useMemo(() => reserves, [reserves]);

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
    //     id: 'id',
    //     desc: true,
    //   },
    // ],
    filters: [
      { id: window.innerWidth > 768 ? 'status' : 'mobile', value: 'EM ESPERA' },
    ],
    pageSize: 20,
    hiddenColumns: [
      ...columns.filter((col) => col.isVisible === false).map((col) => col.id),
      ...columns
        .filter((col) => col.isVisible === false)
        .map((col) => col.accessor),
    ],
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

      groupStatus: (rows, ids, filterValue) => {
        const filterRows = rows.filter((row) => {
          switch (filterValue) {
            case 'EM ESPERA':
              return (
                !row.original.canceledAt &&
                !row.original.withdrawnAt &&
                !row.original.separatedAt
              );
            case 'SEPARADA':
              return (
                !row.original.withdrawnAt &&
                !row.original.canceledAt &&
                row.original.separatedAt
              );
            case 'UTILIZADA':
              return row.original.withdrawnAt;
            case 'CANCELADA':
              return row.original.canceledAt;
            default:
              return row;
          }
        });
        return filterRows;
      },
    }),
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <div>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </div>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(({ row }) => {
    const columnsSub = [
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
          <Row>
            <span {...row.getToggleRowExpandedProps()}>
              {row.isExpanded ? '▽' : '▷'}
            </span>
          </Row>
        ),
      },
      {
        Header: 'ID',
        accessor: 'materialId',
        width: 125,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Denominação',
        accessor: 'name',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Unidade',
        accessor: 'unit',
        width: 100,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Qtd',
        accessor: 'quantity',
        width: 100,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Valor',
        accessor: 'value',
        width: 100,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
      {
        Header: () => (
          // FORMAT HEADER
          <div className="p-auto text-center">ID - Denominação - Qtd - Und</div>
        ),
        id: 'mobile',
        width: 100,
        disableResizing: false,
        isVisible: window.innerWidth < 768,
        Cell: ({ value, row }) => (
          <div
          // onTouchMove={(e) => {
          //   // verifica se arrastou suficiente para a direita
          //   if (e.touches[0].clientX < 300) return;
          //   handlePushItem(e, row);
          // }}
          >
            <Row className="d-flex justify-content-between">
              <Col xs="auto" className="p-auto text-start">
                <Badge bg="light" text="dark">
                  {row.values.materialId}
                </Badge>
              </Col>
              <Col xs="auto" className="p-auto text-start">
                <Badge bg="light" text="dark">
                  {row.values.quantity} {row.values.unit}
                </Badge>
              </Col>
            </Row>
            <Row>
              <Col className="p-auto text-start">{row.values.name}</Col>
            </Row>
          </div>
        ),
        disableSortBy: true,
        // filterValue: 1,
        // filter: filterGreaterThan,
        // Filter: FilterForTotal,
        // defaultCanFilter: true,
      },
    ];
    return (
      <TableNestedrow
        style={{ padding: 0, margin: 0 }}
        columns={columnsSub}
        data={row.original.MaterialReserveItems}
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
          //     id: 'name',
          //     asc: true,
          //   },
          // ],
          hiddenColumns: [
            ...columnsSub
              .filter((col) => col.isVisible === false)
              .map((col) => col.id),
            ...columnsSub
              .filter((col) => col.isVisible === false)
              .map((col) => col.accessor),
          ],
        }}
        filterTypes={filterTypes}
        renderRowSubComponent={renderRowSubSubComponent}
      />
    );
  }, []);

  return (
    <>
      <Loading isLoading={isLoading} />
      <EditModal // modal p/ pesquisa de materiais
        handleClose={handleCloseEditModal}
        show={showEditModal}
        data={dataModal}
        handleSave={handleSaveEditModal}
      />

      <Row className="text-center py-3">
        <Card.Title>Relação de Reservas</Card.Title>
        <Card.Text>
          Reservas realizadas para retirada no almoxarifado provisório da DIMAN.
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
    </>
  );
}
