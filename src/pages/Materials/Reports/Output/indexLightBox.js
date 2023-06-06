/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaCommentDots,
  FaInfo,
  FaDirections,
  FaPencilAlt,
  FaRedoAlt,
  FaSyncAlt,
  FaRegEdit,
  FaSearch,
  FaSearchPlus,
  FaSearchMinus,
  FaExclamationTriangle,
  FaExclamation,
  FaImages,
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
  Image,
} from 'react-bootstrap';

import LightGallery from 'lightgallery/react';
// If you want you can use SCSS instead of css
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

import EditModal from './components/EditModal';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../components/TableNestedRow';

// trigger to custom filter
function DefaultColumnFilter() {
  return <> </>;
} // as colunas padrao nao aplicam filtro

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  toggleAllRowsExpanded,
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
            // onClick={() => toggleAllRowsExpanded(true)}
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
          >
            {filterValue ? <span>{filterValue}</span> : <FaSearch />}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                // toggleAllRowsExpanded(false);
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
  toggleAllRowsExpanded,
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
          onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
        />
      </Col>
    </Row>
  );
}
function InputDateColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  toggleAllRowsExpanded,
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
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
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
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
            style={{ width: '110px' }}
          />
        </Col>
      </Row>
    </>
  );
}
function InputValueColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  toggleAllRowsExpanded,
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
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
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
            onFocus={() => toggleAllRowsExpanded(false)} // tirando a expansao antes de filtrar, evita bugs
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

const renderTooltipImage = (props, message, src) => (
  <Tooltip id="button-tooltip" className="opacity-100" {...props}>
    <Image
      crossOrigin=""
      src={src}
      alt="Foto de perfil do colaborador"
      width="150"
      rounded="true"
    />

    {message}
  </Tooltip>
);

export default function Index() {
  const userId = useSelector((state) => state.auth.user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dataModal, setDataModal] = useState('');

  async function getData() {
    try {
      setIsLoading(true);
      const response = await axios.get('/materials/out/');
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

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleSaveEditModal = () => {
    setShowEditModal(false);
    getData();
  };
  const handleShowEditModal = (data) => {
    setDataModal(data);
    setShowEditModal(true);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleAskUpdateUserReplacement = (e, values) => {
    e.preventDefault();
    const exclamation = e.currentTarget.nextSibling;
    exclamation.className = exclamation.className.replace('d-none', 'd-inline');
    e.currentTarget.className += ' d-none';
    return true;

    // e.currentTarget.remove();
  };

  const handleUpdateUserReplacement = async (e, values) => {
    e.preventDefault();
    const { id } = values;
    const updateSeparation = {
      userReplacementId: userId,
    };
    const btn = e.currentTarget;

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO DA SEPARAÇÃO
      await axios.put(`/materials/out/${id}`, updateSeparation);

      setIsLoading(false);
      btn.class += 'd-none';
      btn.remove();
      // getData();

      toast.success(`Reposição informada com sucesso`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const data = React.useMemo(() => reqs, [reqs]);

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
        Cell: ({ value, row }) => (
          <div>
            {value}{' '}
            {row.original.MaterialReturned.length ? (
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Houve retorno')}
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
        Header: 'Tipo',
        accessor: 'type',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value, row }) => {
          function TipoSaida({ param }) {
            switch (param) {
              case 'USO':
                return <Badge bg="success">{param}</Badge>;
              case 'EMPRÉSTIMO':
                return <Badge bg="secondary">{param}</Badge>;
              case 'DESCARTE':
                return <Badge bg="warning">{param}</Badge>;
              case 'DOAÇÃO':
                return <Badge bg="info">{param}</Badge>;
              case 'DEVOLUÇÃO':
                return <Badge bg="dark">{param}</Badge>;
              case 'EXTRAVIO':
                return <Badge bg="danger">{param}</Badge>;
              default:
                return <Badge>{param}</Badge>;
            }
          }

          const getItems = useCallback(
            () =>
              row.original.MaterialOutFiles.map((item) => (
                <a
                  key={item.order}
                  // data-lg-size={item.size}
                  // className="gallery-item"
                  href={`${process.env.REACT_APP_BASE_AXIOS_REST}/uploads/materials/out/images/${item.filename}`}
                >
                  <img
                    alt={`Imagem ${item.order}`}
                    // style={{ maxWidth: '280px' }}
                    className="d-none"
                    src={`${process.env.REACT_APP_BASE_AXIOS_REST}/uploads/materials/out/images/${item.filename}`}
                    crossOrigin="anonymous"
                  />
                  {item.order === 1 ? (
                    <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={(props) => renderTooltip(props, 'Ver fotos')}
                    >
                      <Button
                        // size="sm"
                        variant="outline-primary"
                        className="border-0 m-0"
                      >
                        <FaImages />
                      </Button>
                    </OverlayTrigger>
                  ) : null}
                </a>
              )),
            []
          );

          return (
            <>
              <TipoSaida param={value} />
              {row.original.MaterialOutFiles.length ? (
                <div>
                  {' '}
                  <Col xs="auto" className="text-center m-0 p-0 pt-1 px-1">
                    <LightGallery
                      // onInit={onInit}
                      speed={500}
                      plugins={[lgThumbnail, lgZoom]}
                    >
                      {getItems()}
                    </LightGallery>
                  </Col>
                </div>
              ) : null}
            </>
          );
        },
        Filter: SelectColumnFilter,
        filter: 'includes',
      },
      {
        Header: 'Retira',
        accessor: 'createdAtBr',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
        Filter: InputDateColumnFilter,
        filter: 'rangeDate',
      },
      {
        Header: 'Profissional',
        accessor: 'removedBy',
        width: 200,
        disableResizing: true,
        Cell: ({ value, row }) => (
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) =>
              renderTooltipImage(
                props,
                row.original.Worker?.WorkerContracts[0]?.WorkerJobtype?.job ??
                  'SERVIDOR',
                `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/${
                  row.original.Worker?.filenamePhoto ?? 'default.png'
                }`
              )
            }
          >
            <Row
              onClick={(e) => alert('Funcionalidade em implantação')}
              style={{ cursor: 'pointer' }}
            >
              <Col>{value || row.original.authorizerUsername} </Col>
            </Row>
          </OverlayTrigger>
        ),
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Autorização',
        accessor: 'authorizerUsername',
        width: 150,
        disableResizing: true,
        Cell: (props) => {
          const custom = String(props.value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Expedição',
        accessor: 'userUsername',
        width: 150,
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
        filter: 'text',
      },
      {
        Header: 'Local',
        accessor: 'place',
        disableSortBy: true,
        Filter: InputColumnFilter,
        filter: 'text',
      },
      {
        Header: 'Valor',
        accessor: 'valueBr',
        width: 120,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        Cell: ({ value }) => <div className="text-end">{value}</div>,
        // disableSortBy: true,
        Filter: InputValueColumnFilter,
        filter: 'rangeValue',
      },
      {
        Header: 'Ações',
        id: 'actions',
        width: 110,
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
              {row.original.userReplacementId ||
              row.original.reqMaterial ? null : (
                <>
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) =>
                      renderTooltip(
                        props,
                        'Informar RM de reposição criada no SIPAC'
                      )
                    }
                  >
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="border-0 m-0"
                      onClick={(e) => {
                        handleAskUpdateUserReplacement(e);
                      }}
                    >
                      <FaRedoAlt />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) =>
                      renderTooltip(props, 'Confirmar informação de RM criada!')
                    }
                  >
                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="border-0 m-0 d-none"
                      onClick={(e) => {
                        handleUpdateUserReplacement(e, row.original);
                      }}
                    >
                      <FaExclamation />
                    </Button>
                  </OverlayTrigger>
                </>
              )}
            </Col>
            <Col xs="auto" className="text-center m-0 p-0 px-1">
              <OverlayTrigger
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Editar saída')}
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
                        `Saída só pode ser editada pelo expedidor ou autorizador.`
                      );
                    }
                    return handleShowEditModal(row.original);
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

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </>
    ),
    []
  );

  const renderRowSubSub1Component = React.useCallback(
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

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
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
          data={row.original.MaterialOutItems}
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

        {row.original.MaterialReturned.length ? (
          <>
            <br />
            <Row>
              <Col className="text-center">
                <span className="text-center fw-bold">RETORNOS</span>
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
                  Header: 'Retorno em:',
                  accessor: 'createdAtBr',
                  width: 160,
                  disableResizing: true,
                },
                {
                  Header: 'Valor',
                  accessor: 'valueBr',
                  width: 120,
                  disableResizing: true,
                },
                // {
                //   Header: 'Receb. por:',
                //   accessor: 'receivedBy',
                //   width: 150,
                //   disableResizing: true,
                //   Cell: (props) => {
                //     const custom = String(props.value).replace(
                //       /(^[a-z]*)\.([a-z]*).*/gm,
                //       '$1.$2'
                //     ); // deixar só os dois primeiros nomes
                //     return <span> {custom}</span>;
                //   },
                // },
                // {
                //   Header: 'Unidade de Custo',
                //   accessor: 'costUnit',
                //   isVisible: window.innerWidth > 768,
                //   // eslint-disable-next-line react/destructuring-assignment
                //   Cell: (props) => {
                //     const custom = String(props.value).replace(
                //       /([0-9]{2})/gm,
                //       '$1.'
                //     );
                //     return props.value ? (
                //       <span title={props.row.original.costUnitNome}>
                //         {custom} {props.row.original.costUnitSigla}
                //       </span>
                //     ) : null;
                //   },
                // },
              ]}
              data={row.original.MaterialReturned}
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
              renderRowSubComponent={renderRowSubSub1Component}
            />
          </>
        ) : null}
      </>
    ),
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
              row.original.MaterialOutItems?.length > 0
            ) {
              const [, ...arrayFilterSub] = arrayFilter;
              const materials = row.original.MaterialOutItems;

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

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <EditModal // modal p/ pesquisa de materiais
          handleClose={handleCloseEditModal}
          show={showEditModal}
          data={dataModal}
          handleSave={handleSaveEditModal}
        />
        <Row className="text-center py-3">
          <Card.Title>Relatório de Saída: Materiais</Card.Title>
          <Card.Text>
            Materiais com saída registrada por Uso, Descarte, Devolução, Doação,
            Extravio, Empréstimo, etc.
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
