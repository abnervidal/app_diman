/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Formik, FieldArray } from 'formik'; // FormValidation
import * as yup from 'yup'; // RulesValidation
import Select from 'react-select';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../../../../../services/axios';
import {
  primaryDarkColor,
  body1Color,
  body2Color,
} from '../../../../../config/colors';
import Loading from '../../../../../components/Loading';

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

// Get the current date in the last instant of day
const currentDate = new Date();
currentDate.setHours(23, 59, 59, 999);

// Get the first day of the current month
// const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// Get the first day of the current year
const firstDay = new Date(new Date().getFullYear(), 0, 1);

// Get ten days before of the current day in the first instant of day
// const firstDay = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);
// firstDay.setHours(0, 0, 0, 0);

// Get the last day of the current month
// const lastDay = new Date(
//   currentDate.getFullYear(),
//   currentDate.getMonth() + 1,
//   0
// );

const initialValues = {
  startDate: firstDay.toISOString().split('T')[0],
  endDate: currentDate.toISOString().split('T')[0],
  idWorker: [],
};

function FilterDate({ getData }) {
  const [inventoryData, setinventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getMaterialsData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/');
        setinventoryData(response.data);
        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    getMaterialsData();

    // getData(initialValues);
  }, []);

  const handleStore = async (values, resetForm) => {
    const formattedValues = {
      ...values,
    };

    formattedValues.id = formattedValues.idWorker
      .map((obj, index) => `id[${index + 1}]=${obj.workerId}`)
      .join('&');

    console.log(formattedValues);

    const queryString = `?${formattedValues.id}&startDate=${formattedValues.startDate}&endDate=${formattedValues.endDate}`;

    try {
      setIsLoading(true);
      getData(queryString);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      console.log(err);
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

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

  const handlePushItem = (push, row, list) => {
    console.log(row);
    // adicionar na lista de saída
    push({
      workerId: row.value.id,
      name: row.value.name,
      job: row.value.job,
    });
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          handleStore(values, resetForm);
        }}
      >
        {({
          submitForm,
          resetForm,
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
            <Row
              className="text-center"
              style={{ background: primaryDarkColor, color: 'white' }}
            >
              <span className="fs-6">
                LISTA DE COLABORADORES A SEREM PESQUISADOS
              </span>
            </Row>
            <FieldArray name="idWorker">
              {(fieldArrayProps) => {
                const { remove, push } = fieldArrayProps;
                return (
                  <>
                    <Row className="d-flex align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                      {/* <Col sm="12" md="auto">
                            PESQUISA RÁPIDA:
                          </Col> */}
                      <Col>
                        {' '}
                        <Select
                          inputId="searchWorker"
                          options={inventoryData.map((worker) => ({
                            value: worker,
                            label: `${worker.name} (${worker.job})`,
                          }))}
                          value={null}
                          onChange={(selected, action) => {
                            handlePushItem(push, selected, values);
                            setFieldValue('searchWorker', '');
                          }}
                          placeholder="Selecione o colaborador"
                          onBlur={() => setFieldValue('searchWorker', '')}
                          escapeClearsValue
                          filterOption={filterOptions}
                        />
                      </Col>
                    </Row>
                    <Row style={{ background: body2Color }}>
                      {values.idWorker?.length > 0 &&
                        values.idWorker?.map((item, index) => (
                          <>
                            <Row className="d-block d-lg-none">
                              <Col className="fw-bold">Item nº {index + 1}</Col>
                            </Row>
                            <Row
                              key={item.workerId}
                              className="d-flex p-0 m-0 border-bottom"
                            >
                              <Form.Group
                                as={Col}
                                xs={12}
                                lg={2}
                                controlId={`idWorkerSearch[${index}].workerId`}
                                className="d-none border-0 m-0 p-0"
                              >
                                {index === 0 ? (
                                  <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                    WORKER ID
                                  </Form.Label>
                                ) : null}
                                <Form.Control
                                  type="text"
                                  plaintext
                                  readOnly
                                  value={item.workerId}
                                  onChange={handleChange}
                                  placeholder="Selecione o ID worker"
                                  onBlur={handleBlur}
                                  size="sm"
                                  className="p-0 m-0 ps-2"
                                  tabindex="-1"
                                />
                              </Form.Group>
                              <Form.Group
                                as={Col}
                                controlId={`idWorkerSearch[${index}].name`}
                                className="border-0 m-0 p-0"
                              >
                                {index === 0 ? (
                                  <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                    DESCRIÇÃO
                                  </Form.Label>
                                ) : null}
                                <div className="px-2">{item.name}</div>
                              </Form.Group>
                              <Form.Group
                                as={Col}
                                xs={12}
                                lg={4}
                                controlId={`idWorkerSearch[${index}].job`}
                              >
                                {index === 0 ? (
                                  <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                    FUNÇÃO
                                  </Form.Label>
                                ) : null}
                                <div className="px-2">{item.job}</div>
                              </Form.Group>

                              <Col
                                xs={12}
                                lg={2}
                                className="d-flex justify-content-between"
                              >
                                <Col
                                  as={Col}
                                  xs="2"
                                  sm="auto"
                                  className="border-0 m-0 p-0 text-center"
                                >
                                  {index === 0 ? (
                                    <Row>
                                      <Col xs="auto" className="d-flex">
                                        <div
                                          className="d-none d-lg-block"
                                          style={{
                                            width: '6px',
                                            height: '34px',
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ) : null}
                                  <Row>
                                    <Col xs="auto">
                                      <Button
                                        onClick={() => remove(index)}
                                        variant="outline-danger"
                                        size="sm"
                                        className="border-0"
                                        tabindex="-1"
                                      >
                                        <FaTrashAlt size={18} />
                                      </Button>
                                    </Col>
                                  </Row>
                                </Col>
                              </Col>
                            </Row>
                          </>
                        ))}
                    </Row>
                  </>
                );
              }}
            </FieldArray>
            <Row className="pt-4">
              <Col xs="auto">
                {touched.idWorker && typeof errors.idWorker === 'string' ? (
                  <Badge bg="danger">{errors.idWorker}</Badge>
                ) : touched.idWorker && errors.idWorker ? (
                  <Badge bg="danger">
                    A quantidade de item não pode ser 0.
                  </Badge>
                ) : null}
              </Col>
            </Row>

            {/* <Row className="justify-content-center">
              <Col xs="auto" className="text-center pt-2 pb-4">
                <Button
                  type="reset"
                  variant="warning"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  Limpar
                </Button>
              </Col>

              <Col xs="auto" className="text-center pt-2 pb-4">
                <Button variant="success" onClick={submitForm}>
                  Pesquisar
                </Button>
              </Col>
            </Row> */}
          </Form>
        )}
      </Formik>
    </>
  );
}

export default FilterDate;
