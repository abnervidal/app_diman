/* eslint-disable react/prop-types */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  FaPencilAlt,
  FaSearch,
  FaSearchPlus,
  FaSearchMinus,
  FaExclamationTriangle,
  FaEllipsisH,
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
  Image,
  Dropdown,
  Form,
} from 'react-bootstrap';

import axios from '../../../../../services/axios';
import Loading from '../../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../../../Materials/components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../../../Materials/components/TableNestedRow';

import ModalEdit from './components/ModalEdit';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

const renderTooltipImage = (props, message, src) => (
  <Tooltip id="button-tooltip" className="opacity-100" {...props}>
    <Image
      crossOrigin=""
      src={src}
      alt="Foto de perfil do colaborador"
      width="150"
      rounded="true"
    />

    <div>{message}</div>
  </Tooltip>
);

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

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [workersTasks, setWorkersTasks] = useState([]);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState({});

  async function getWorkers() {
    try {
      setIsLoading(true);
      const response = await axios.get(`/workerstasks`);
      setWorkersTasks(response.data);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  }

  // cancel modal -> don't update data
  const handleCancelModal = () => {
    setShowModalEdit(false);
  };

  // close modal -> update data
  const handleSaveModal = () => {
    setShowModalEdit(false);
    getWorkers();
  };

  const handleShowModalEdit = (item) => {
    setDataEdit(item);
    setShowModalEdit(true);
  };

  useEffect(() => {
    getWorkers();
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
        Header: 'Req. Man.',
        accessor: 'reqMaintenance',
        width: 100,
        disableResizing: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ value, row }) => (
          <div>
            {value}{' '}
            {row.original.WorkerTaskRisks.length ? (
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) =>
                  renderTooltip(
                    props,
                    <>
                      <div className="pb-1 fw-bold">RISCOS</div>
                      {row.original.WorkerTaskRisks.map((risk) => (
                        <div className="pb-1 text-start">
                          &bull; {risk.WorkerTaskRisktype.type}
                        </div>
                      ))}
                    </>
                  )
                }
              >
                <Button
                  size="sm"
                  variant="outline-warning"
                  className="border-0 m-0"
                >
                  <FaExclamationTriangle />
                </Button>
              </OverlayTrigger>
            ) : null}
          </div>
        ),
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Título',
        accessor: 'title',
        disableSortBy: true,
        width: 200,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: ({ value, row }) => (
          <div className="text-start">Instalaçao Física</div>
        ),
        id: 'building',
        accessor: (originalRow) => originalRow.BuildingSipac?.name,
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value, row }) => (
          <>
            <div className="text-start">{value}</div>
            <div className="text-start fw-bold" style={{ fontSize: '0.8em' }}>
              {row.original.PropertySipac?.nomeImovel} -{' '}
              <Badge bg="secondary">
                {row.original.PropertySipac?.municipio}
              </Badge>
            </div>
          </>
        ),
      },

      {
        Header: 'Data Serviço',
        accessor: (originalRow) => originalRow.startBr,
        disableSortBy: true,
        width: 150,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value, row }) => (
          <>
            <div>De: {value}</div>
            <div>Até: {row.original.endBr}</div>
          </>
        ),
      },
      {
        Header: 'Status',
        id: 'status',
        accessor: (originalRow) =>
          originalRow.WorkerTaskStatuses[0]?.WorkerTaskStatustype?.type,
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
        width: 150,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
        Cell: ({ value, row }) => (
          <>
            <div>{value}</div>
            <div>{row.original.WorkerTaskStatuses[0]?.createdAtBr}</div>
          </>
        ),
      },
      // {
      //   Header: 'Idade',
      //   id: 'age',
      //   width: 70,
      //   disableResizing: true,
      //   accessor: (originalRow) =>
      //     originalRow.birthdate
      //       ? Math.floor(
      //           (new Date() - new Date(originalRow.birthdate).getTime()) /
      //             3.15576e10
      //         )
      //       : null,
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'CPF',
      //   accessor: 'cpf',
      //   width: 130,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   Cell: ({ value }) => {
      //     if (!value) return null;
      //     const custom = value.replace(
      //       /(\d{3})(\d{3})(\d{3})(\d{2})/gm,
      //       '$1.$2.$3-$4'
      //     ); // deixar só os dois primeiros nomes
      //     return <span> {custom}</span>;
      //   },
      //   Filter: InputColumnFilter,
      //   filter: 'text',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Contrato',
      //   id: 'contract',
      //   width: 100,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   accessor: (originalRow) => {
      //     const index = originalRow.WorkerContracts.length;
      //     if (index === 0) return 'INATIVO';
      //     if (originalRow.WorkerContracts[index - 1]?.end) return 'DESLIGADO';
      //     return originalRow.WorkerContracts[index - 1]?.Contract?.codigoSipac;
      //   },
      //   Filter: SelectColumnFilter,
      //   filter: 'includes',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Função',
      //   id: 'job',
      //   width: 200,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   accessor: (originalRow) => {
      //     const index = originalRow.WorkerContracts.length;
      //     if (index === 0) return 'INDEFINIDO';
      //     return originalRow.WorkerContracts[index - 1]?.WorkerJobtype?.job;
      //   },
      //   Filter: SelectColumnFilter,
      //   filter: 'exactText',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Regime',
      //   id: 'regime',
      //   width: 140,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   accessor: (originalRow) => {
      //     const index = originalRow.WorkerContracts.length;
      //     if (index === 0) return '';
      //     if (!originalRow.WorkerContracts[index - 1]?.WorkerContractRegime)
      //       return '';
      //     return originalRow.WorkerContracts[index - 1]?.WorkerContractRegime
      //       .regime;
      //   },
      //   Filter: SelectColumnFilter,
      //   filter: 'exactText',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Phone',
      //   accessor: 'phone',
      //   width: 140,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   Cell: ({ value }) => {
      //     if (!value) return null;
      //     const custom = value.replace(
      //       /(\d{2})(\d{1})(\d{4})(\d{4})/gm,
      //       '($1) $2.$3-$4'
      //     ); // deixar só os dois primeiros nomes
      //     return <span> {custom}</span>;
      //   },
      //   Filter: InputColumnFilter,
      //   filter: 'text',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Atuação',
      //   id: 'acting',
      //   width: 200,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   accessor: (originalRow) => {
      //     const index = originalRow.WorkerContracts.length;
      //     if (index === 0) return '';
      //     if (!originalRow.WorkerContracts[index - 1]?.acting) return '';
      //     return originalRow.WorkerContracts[index - 1]?.acting;
      //   },
      //   Filter: SelectColumnFilter,
      //   filter: 'exactText',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'E-mail',
      //   accessor: 'email',
      //   width: 160,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   Filter: InputColumnFilter,
      //   filter: 'text',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: 'Unidade',
      //   id: 'unit',
      //   width: 120,
      //   disableResizing: true,
      //   disableSortBy: true,
      //   accessor: (originalRow) => {
      //     const index = originalRow.WorkerContracts.length;
      //     return `${originalRow.WorkerContracts[index - 1]?.Unidade?.id}-${
      //       originalRow.WorkerContracts[index - 1]?.Unidade?.sigla
      //     }`;
      //   },
      //   Filter: SelectColumnFilter,
      //   filter: 'includes',
      //   isVisible: window.innerWidth > 768,
      // },
      // {
      //   Header: ({ value, row }) => (
      //     <div className="text-start">Nome - Função - Contrato</div>
      //   ),
      //   id: 'mobile',
      //   width: 100,
      //   disableResizing: false,
      //   disableSortBy: true,
      //   defaultCanFilter: true,
      //   isVisible: window.innerWidth < 768,
      //   Cell: ({ value, row }) => {
      //     const index = row.original.WorkerContracts.length;
      //     return (
      //       <>
      //         <Row>
      //           <Col xs="12" className="text-start mb-0 pb-0">
      //             {row.original.name}
      //           </Col>
      //         </Row>

      //         <Row>
      //           <Col xs="auto" className="mt-0 pt-0">
      //             <Badge
      //               className="text-dark bg-light"
      //               style={{
      //                 fontSize: '0.8em',
      //               }}
      //             >
      //               {index > 0
      //                 ? row.original.WorkerContracts[index - 1]?.WorkerJobtype
      //                     ?.job
      //                 : 'INDEFINIDO'}
      //             </Badge>
      //           </Col>
      //           <Col xs="auto" className="mt-0 pt-0">
      //             <Badge
      //               className="text-dark bg-light"
      //               style={{
      //                 fontSize: '0.8em',
      //               }}
      //             >
      //               {index === 0
      //                 ? 'INATIVO'
      //                 : row.original.WorkerContracts[index - 1]?.end
      //                 ? 'DESLIGADO'
      //                 : row.original.WorkerContracts[index - 1]?.Contract
      //                     ?.codigoSipac}
      //             </Badge>
      //           </Col>
      //         </Row>
      //       </>
      //     );
      //   },
      // },
      {
        // Make an action cell
        Header: 'Ações', // No header
        id: 'actions', // It needs an ID
        width: 80,
        disableResizing: true,
        Cell: ({ row }) => (
          <Row className="d-flex flex-nowrap">
            <Col xs="auto" className="text-center ms-2 m-0 p-0 px-1">
              <OverlayTrigger
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Editar serviço')}
              >
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="border-0 m-0"
                  onClick={(e) => handleShowModalEdit(row.original)}
                >
                  <FaPencilAlt />
                </Button>
              </OverlayTrigger>
            </Col>
            <Col xs="auto" className="text-center  m-0 p-0 px-1">
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Atualizar status')}
              >
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="border-0 m-0"
                  onClick={(e) => handleShowModalEdit(row.original)}
                >
                  <FaEllipsisH />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        ),
      },
    ],
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(({ row }) => {
    const columns1 = [
      {
        Header: 'Nome',
        id: 'nome',
        disableSortBy: true,
        accessor: (originalRow) => originalRow.User?.name,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Cargo',
        id: 'cargo',
        accessor: (originalRow) =>
          originalRow.User?.UserPositions[0]?.UserPositiontype?.position,
        width: 300,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
    ];
    const columns2 = [
      {
        Header: 'Nome',
        id: 'nome',
        disableSortBy: true,
        accessor: (originalRow) => originalRow.Worker?.name,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Função',
        id: 'job',
        accessor: (originalRow) =>
          originalRow.Worker?.WorkerContracts[0]?.WorkerJobtype?.job,
        width: 200,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
      {
        Header: 'Empresa',
        id: 'empresa',
        accessor: (originalRow) =>
          originalRow.Worker?.WorkerContracts[0]?.Contract?.Provider
            ?.nomeFantasia,
        width: 300,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
    ];
    const columns3 = [
      {
        Header: 'Status',
        id: 'status',
        disableSortBy: true,
        width: 200,
        disableResizing: true,
        accessor: (originalRow) => originalRow.WorkerTaskStatustype?.type,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Usuário',
        id: 'user',
        accessor: (originalRow) => originalRow.User?.username,
        width: 200,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
      {
        Header: 'Data',
        id: 'data',
        accessor: (originalRow) => originalRow.createdAtBr,
        width: 300,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
        // eslint-disable-next-line react/destructuring-assignment
      },
    ];
    return (
      <>
        <div>
          <Row className="mb-2">
            <Col>
              {' '}
              <Badge>REGISTROS DO SERVIÇO</Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <TableNestedrow
                style={{ padding: 0, margin: 0 }}
                columns={columns3}
                data={row.original.WorkerTaskStatuses}
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
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.id),
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.accessor),
                  ],
                }}
                filterTypes={filterTypes}
              />
            </Col>
          </Row>
        </div>
        <div>
          <Row className="mb-2">
            <Col>
              {' '}
              <Badge>SERVIDORES RELACIONADOS</Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <TableNestedrow
                style={{ padding: 0, margin: 0 }}
                columns={columns1}
                data={row.original.WorkerTaskServants}
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
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.id),
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.accessor),
                  ],
                }}
                filterTypes={filterTypes}
              />
            </Col>
          </Row>
        </div>
        <div>
          <Row className="mb-2">
            <Col>
              {' '}
              <Badge>TRABALHADORES ESCALADOS</Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <TableNestedrow
                style={{ padding: 0, margin: 0 }}
                columns={columns2}
                data={row.original.WorkerTaskItems}
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
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.id),
                    ...columns
                      .filter((col) => col.isVisible === false)
                      .map((col) => col.accessor),
                  ],
                }}
                filterTypes={filterTypes}
              />
            </Col>
          </Row>
        </div>
      </>
    );
  }, []);

  const data = React.useMemo(() => workersTasks, [workersTasks]);

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
    sortBy: [
      {
        id: 'name',
        asc: true,
      },
    ],
    pageSize: 50,
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

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <ModalEdit // modal p/ liberação de materiais
          handleCancelModal={handleCancelModal}
          handleSaveModal={handleSaveModal}
          show={showModalEdit}
          data={dataEdit}
        />
        <Row className="text-center py-3">
          <Card.Title>Serviços Externos, Extras ou de Risco</Card.Title>
          <Card.Text>
            Listagem de todos os serviços externos (inclusive em outros
            municípios), extras (realizado fora do horário de expediente) e de
            risco (associado a algum risco no ambiente de trabalho).
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
