/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Formik } from 'formik'; // FormValidation
import * as yup from 'yup'; // RulesValidation
import { toast } from 'react-toastify';
import Select from 'react-select';

import {
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
  Image,
  Dropdown,
  Form,
} from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedRowHiddenRows from '../../../Materials/components/TableGfilterNestedRowHiddenRows';
import TableNestedrow from '../../../Materials/components/TableNestedRow';

import ModalEdit from './components/ModalEdit';

const schema = yup.object().shape({
  startDate: yup
    .date()
    .max(
      new Date().toISOString().split('T')[0],
      'Escolha uma data passada para a data de início'
    ),
  // endDate: yup
  //   .date()
  //   .max(
  //     new Date().toISOString().split('T')[0],
  //     'Escolha uma data passada para a data final'
  //   ),
});

// Get the current date
const currentDate = new Date();

// Get the first day of the current month
const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// Get the last day of the current month
const lastDay = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
);

const initialValues = {
  startDate: firstDay.toISOString().split('T')[0],
  endDate: lastDay.toISOString().split('T')[0],
};

const formatGroupLabel = (data) => (
  <Col className="d-flex justify-content-between">
    <span>{data.label}</span>
    <Badge bg="secondary">{data.options.length}</Badge>
  </Col>
);

const filterOptions = (row, filterValue) => {
  const arrayFilter = String(filterValue).split(' ');

  return arrayFilter.reduce((res, cur) => {
    // res -> response; cur -> currency (atual)
    res =
      res &&
      String(row.label).toLowerCase().includes(String(cur).toLowerCase());
    return res;
  }, true);
};

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
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState({});
  const [manualFrequencies, setManualFrequencies] = useState([]);
  const inputRef = useRef();

  // cancel modal -> don't update data
  const handleCancelModal = () => {
    setShowModalEdit(false);
  };

  // close modal -> update data
  const handleSaveModal = () => {
    setShowModalEdit(false);
  };

  const handleShowModalEdit = (id) => {
    setDataEdit(id);
    setShowModalEdit(true);
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
        isVisible: window.innerWidth > 768,
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
        Header: `ID`,
        accessor: 'id',
        disableSortBy: true,
        isVisible: false,
      },
      {
        Header: `Contrato`,
        accessor: (originalRow) => originalRow.Contract.codigoSipac,
        width: 150,
        disableResizing: true,
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: `Unidade`,
        accessor: (originalRow) =>
          `${originalRow.Unidade.id} - ${originalRow.Unidade.sigla}`,
        width: 250,
        disableResizing: true,
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: `date`,
        accessor: 'date',
        disableSortBy: true,
        isVisible: false,
      },
      {
        Header: 'Data',
        id: 'data',
        width: 350,
        disableResizing: true,
        disableSortBy: true,
        accessor: (originalRow) => {
          const myDate = originalRow.date.split('-');
          const dateFormated = new Date(
            myDate[0],
            Number(myDate[1]) - 1,
            myDate[2]
          );
          const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          };
          const dateString = dateFormated.toLocaleDateString('pt-BR', options);
          return dateString;
        },
        isVisible: window.innerWidth > 768,
      },
      {
        Header: `Obs`,
        accessor: 'obs',
        disableSortBy: true,
      },
      {
        Header: `Usuário`,
        accessor: (originalRow) => originalRow.User.username,
        width: 200,
        disableResizing: true,
        disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: () => <div className="p-auto text-center">Editar</div>,
        id: 'edit',
        width: 70,
        disableResizing: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ value, row }) => (
          <Row className="d-flex flex-nowrap">
            <Col xs="12" className="text-center m-0 p-0 px-2 ps-2">
              <OverlayTrigger
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, `Editar registro`)}
              >
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="border-0 m-0"
                  onClick={(e) => handleShowModalEdit(row.original.id)}
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

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(({ row }) => {
    const columns = [
      {
        Header: () => <div className="text-start">Nome</div>,
        id: `name`,
        accessor: (originalRow) => originalRow.Worker.name,
        // disableSortBy: true,
        isVisible: window.innerWidth > 768,
        Cell: ({ value, row }) => (
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            s
            overlay={(props) =>
              renderTooltipImage(
                props,
                value.split(' ')[0],
                `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/${
                  row.original.filenamePhoto ?? 'default.png'
                }`
              )
            }
          >
            <Row
              onClick={(e) => alert('Funcionalidade em implantação')}
              style={{ cursor: 'pointer' }}
            >
              <Col className="text-start">{value} </Col>
            </Row>
          </OverlayTrigger>
        ),
      },
      {
        Header: `Registro`,
        id: 'registro',
        accessor: (originalRow) => originalRow.WorkerManualfrequencytype.type,
        width: 150,
        disableResizing: true,
        // disableSortBy: true,
        Filter: SelectColumnFilter,
        filter: 'exactText',
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Horas',
        accessor: 'hours',
        width: 125,
        disableResizing: true,
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
      },
      {
        Header: 'Observações',
        accessor: 'obs',
        disableSortBy: true,
        isVisible: window.innerWidth > 768,
      },
    ];
    return (
      <>
        <Row className="mb-2">
          <Col>
            {' '}
            <Badge>AUSÊNCIAS VINCULADAS À DATA</Badge>
          </Col>
        </Row>
        <Row>
          <Col>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={columns}
              data={row.original.WorkerManualfrequencyItems}
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
      </>
    );
  }, []);

  const data = React.useMemo(() => manualFrequencies, [manualFrequencies]);

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
        id: 'date',
        desc: true,
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

  const getItems = async (values) => {
    try {
      setIsLoading(true);
      console.log(values);
      const queryString = objectToQueryString(values);

      const response = await axios.get(
        `/workersmanualfrequencies?${queryString}`
      );

      setManualFrequencies(response.data);

      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  };

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
        <Row>
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values) => {
              // getData(values);
              getItems(values);
            }}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Row className="align-items-top">
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={2}
                    controlId="startDate"
                    className="pb-3"
                  >
                    <Form.Label>DATA INÍCIO:</Form.Label>
                    <Form.Control
                      type="date"
                      value={values.startDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Início"
                    />
                    {touched.startDate && !!errors.startDate ? (
                      <Badge bg="danger">{errors.startDate}</Badge>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={2}
                    controlId="endDate"
                    className="pb-3"
                  >
                    <Form.Label>DATA FINAL:</Form.Label>
                    <Form.Control
                      type="date"
                      value={values.endDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Início"
                    />
                    {touched.endDate && !!errors.endDate ? (
                      <Badge bg="danger">{errors.endDate}</Badge>
                    ) : null}
                  </Form.Group>
                  <Col xs="12" sm="auto" lg={1} className="align-self-end pb-3">
                    <Button type="submit" variant="outline-primary">
                      <FaSearch />
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
        <Row className="text-center py-3">
          <Card.Title>Registros de faltas por data</Card.Title>
          <Card.Text>
            Listagem de todos os registros de falta organizados por contrato,
            unidade e data.
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
