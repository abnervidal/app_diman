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
  FaEllipsisH,
} from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Button,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Badge,
  Image,
  Form,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

import ModalEdit from './components/ModalEdit';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../../Materials/components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../../Materials/components/TableNestedRow';

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

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState({});
  const [modalName, setModalName] = useState();

  async function getWorkers() {
    try {
      setIsLoading(true);
      const response = await axios.get(`/properties/buildings`);
      setBuildings(response.data);
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

  const handleShowModalEdit = (item, modalName) => {
    setDataEdit(item);
    setShowModalEdit(true);
    setModalName(modalName);
  };

  useEffect(() => {
    getWorkers();
  }, []);

  const columns = React.useMemo(
    () => [
      // {
      //   // Make an expander cell
      //   Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
      //     <span {...getToggleAllRowsExpandedProps()}>
      //       {isAllRowsExpanded ? '▽' : '▷'}
      //     </span>
      //   ),
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
        Header: ({ value, row }) => <div className="text-start">Sub-rip</div>,
        accessor: 'sub-rip',
        disableSortBy: true,
        width: 180,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        Header: ({ value, row }) => <div className="text-start">ID Infra</div>,
        accessor: 'num_infra',
        disableSortBy: true,
        width: 80,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        Header: ({ value, row }) => <div className="text-start">Nome</div>,
        accessor: 'name',
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        Header: 'Pvtos',
        accessor: 'floors',
        disableSortBy: true,
        width: 80,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        Header: 'Área',
        accessor: 'area',
        disableSortBy: true,
        width: 90,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        Header: 'Zona',
        accessor: 'zone',
        disableSortBy: true,
        width: 80,
        disableResizing: true,
        Filter: InputColumnFilter,
        filter: 'text',
        isVisible: window.innerWidth > 768,
        Cell: ({ value }) => <div className="text-start">{value}</div>,
      },
      {
        // Make an action cell
        Header: '', // No header
        id: 'actions', // It needs an ID
        width: 36,
        disableResizing: true,
        Cell: ({ row }) => (
          <Row className="d-flex flex-nowrap">
            <Col xs="auto" className="text-center">
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Opções')}
              >
                <DropdownButton
                  as={ButtonGroup}
                  // key={direction}
                  id="dropdown-button-drop-end"
                  drop="down"
                  variant="outline-primary"
                  title=""
                  size="sm"
                  style={{ border: 0 }}
                >
                  <Dropdown.Item eventKey="1">Editar instalação</Dropdown.Item>
                  <Dropdown.Item
                    eventKey="2"
                    onClick={(e) =>
                      handleShowModalEdit(row.original, 'Subdivision')
                    }
                  >
                    Subdivisões
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="3"
                    onClick={(e) =>
                      handleShowModalEdit(row.original, 'Geolocation')
                    }
                  >
                    Definir localização
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                </DropdownButton>
              </OverlayTrigger>
            </Col>
          </Row>
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
      // {
      //   // Make an expander cell
      //   Header: () => null, // No header
      //   id: 'actions', // It needs an ID
      //   width: 40,
      //   disableResizing: true,
      //   Cell: ({ row }) => (
      //     // Use Cell to render an expander for each row.
      //     // We can use the getToggleRowExpandedProps prop-getter
      //     // to build the expander.
      //     // <Link to={`/collaborator/record/update/${row.original.id}`}>
      //     <Button
      //       size="sm"
      //       variant="outline-secondary"
      //       className="border-0 m-0"
      //       onClick={(e) => handleShowModalEdit(row.original)}
      //     >
      //       <FaPencilAlt />
      //     </Button>
      //     // </Link>
      //   ),
      // },
    ],
    []
  );

  // Create a function that will render our row sub components
  // const renderRowSubComponent = React.useCallback(({ row }) => {
  //   const columns = [
  //     {
  //       Header: 'Contrato',
  //       id: 'contract',
  //       width: 125,
  //       disableResizing: true,
  //       disableSortBy: true,
  //       accessor: (originalRow) => originalRow.Contract?.codigoSipac,
  //       isVisible: window.innerWidth > 768,
  //     },
  //     {
  //       Header: 'Função',
  //       id: 'job',
  //       accessor: (originalRow) => originalRow.WorkerJobtype?.job,
  //       disableSortBy: true,
  //       isVisible: window.innerWidth > 768,
  //       // eslint-disable-next-line react/destructuring-assignment
  //     },
  //     {
  //       Header: 'Início',
  //       id: 'startBr',
  //       accessor: (originalRow) => originalRow.startBr,
  //       width: 100,
  //       disableResizing: true,
  //       disableSortBy: true,
  //       isVisible: window.innerWidth > 768,
  //     },
  //     {
  //       Header: 'Fim',
  //       accessor: 'endBr',
  //       width: 100,
  //       disableResizing: true,
  //       disableSortBy: true,
  //       isVisible: window.innerWidth > 768,
  //       // eslint-disable-next-line react/destructuring-assignment
  //     },
  //     {
  //       Header: 'Lotado',
  //       id: 'unidade',
  //       width: 200,
  //       disableResizing: true,
  //       disableSortBy: true,
  //       accessor: (originalRow) =>
  //         `${originalRow.Unidade?.id}-${originalRow.Unidade?.sigla}`,
  //       isVisible: window.innerWidth > 768,
  //       // eslint-disable-next-line react/destructuring-assignment
  //     },
  //     {
  //       Header: ({ value, row }) => (
  //         <div className="text-start">Contrato - Função - Inicio - Fim</div>
  //       ),
  //       id: 'mobile',
  //       width: 100,
  //       disableResizing: false,
  //       disableSortBy: true,
  //       defaultCanFilter: true,
  //       isVisible: window.innerWidth < 768,
  //       Cell: ({ value, row }) => (
  //         <Row>
  //           <Col xs="auto" className="text-start mb-0 pb-0">
  //             {row.original.Contract?.codigoSipac}
  //           </Col>
  //           <Col xs="auto" className="mt-0 pt-0">
  //             <Badge
  //               className="text-dark bg-light"
  //               style={{
  //                 fontSize: '0.8em',
  //               }}
  //             >
  //               {row.original.WorkerJobtype?.job}
  //             </Badge>
  //           </Col>
  //           <Col xs="auto" className="mt-0 pt-0">
  //             <Badge
  //               className="text-dark bg-success text-white"
  //               style={{
  //                 fontSize: '0.8em',
  //               }}
  //             >
  //               {row.original.startBr}
  //             </Badge>
  //           </Col>
  //           <Col xs="auto" className="mt-0 pt-0">
  //             <Badge
  //               className="text-dark bg-danger text-white"
  //               style={{
  //                 fontSize: '0.8em',
  //               }}
  //             >
  //               {row.original.endBr}
  //             </Badge>
  //           </Col>
  //         </Row>
  //       ),
  //     },
  //   ];
  //   return (
  //     <>
  //       <Row className="mb-2">
  //         <Col>
  //           {' '}
  //           <Badge>CONTRATOS VINCULADOS AO COLABORADOR</Badge>
  //         </Col>
  //       </Row>
  //       <Row>
  //         <Col>
  //           <TableNestedrow
  //             style={{ padding: 0, margin: 0 }}
  //             columns={columns}
  //             data={row.original.WorkerContracts}
  //             defaultColumn={{
  //               // Let's set up our default Filter UI
  //               // Filter: DefaultColumnFilter,
  //               minWidth: 30,
  //               width: 50,
  //               maxWidth: 800,
  //             }}
  //             initialState={{
  //               // sortBy: [
  //               //   {
  //               //     id: 'name',
  //               //     asc: true,
  //               //   },
  //               // ],
  //               hiddenColumns: [
  //                 ...columns
  //                   .filter((col) => col.isVisible === false)
  //                   .map((col) => col.id),
  //                 ...columns
  //                   .filter((col) => col.isVisible === false)
  //                   .map((col) => col.accessor),
  //               ],
  //             }}
  //             filterTypes={filterTypes}
  //           />
  //         </Col>
  //       </Row>
  //     </>
  //   );
  // }, []);

  const data = React.useMemo(() => buildings, [buildings]);

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
          modalName={modalName}
        />
        <Row className="text-center py-3">
          <Card.Title>Instalações Físicas da UFRN</Card.Title>
          <Card.Text>
            Listagem de todas as instalações físicas da UFRN, inclui edificações
            e infraestrutura.
          </Card.Text>
        </Row>

        <TableGfilterNestedRowHiddenRows
          columns={columns}
          data={data}
          defaultColumn={defaultColumn}
          initialState={initialState}
          filterTypes={filterTypes}
          // renderRowSubComponent={renderRowSubComponent}
        />
      </Container>
    </>
  );
}
