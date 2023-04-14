/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Form as BootstrapForm,
} from 'react-bootstrap';
import Select from 'react-select';
import { FaPhone, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';
import { primaryDarkColor } from '../../../../config/colors';

const emptyValues = {
  car: [],
  worker: [],
  occurrence: [],
  data: '',
  obs: '',
};

const riskOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const validationSchema = Yup.object().shape({
  car: Yup.string().required('Required'),
});

export default function RiskTaskForm({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [cars, setCars] = useState([]);
  const [occurrencestypes, setOccurrencestypes] = useState([]);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/contracts/');
        const response2 = await axios.get('/cars/');
        const response3 = await axios.get('/caroccurrence/types');

        setWorkers(response.data);
        setCars(response2.data);
        setOccurrencestypes(response3.data);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    getData();
  }, []);

  const handleSubmit = (values) => {
    if (isEditMode) {
      // In edit mode, merge the new values with the existing ones
      const mergedValues = { ...initialValues, ...values };
      console.log(mergedValues);
    } else {
      console.log(values);
    }
  };

  const handleResetAll = (values) => {
    console.log(values);
    // colocar outras coisas após o reset que precisar
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <div className="bg-light border rounded pt-2 px-3">
          <Row className="justify-content-center">
            <Col
              xs={12}
              className=" text-center"
              style={{ background: primaryDarkColor, color: 'white' }}
            >
              <span className="fs-5">
                {isEditMode ? 'Editar' : 'Adicionar'} Tarefa
              </span>
            </Col>
          </Row>
          <Row className="pt-2">
            <Formik
              initialValues={initialValues || emptyValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              onReset={handleResetAll}
              enableReinitialize
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                handleReset,
                handleChange,
                handleBlur,
              }) => (
                <Form as BootstrapForm onReset={handleReset}>
                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="car"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CARRO</BootstrapForm.Label>

                      <Field name="car">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.car && touched.car ? 'is-invalid' : null
                            }
                            options={cars.map((item) => ({
                              value: item.id,
                              label: [item.brand, item.model, item.plate],
                            }))}
                            // styles={}
                            value={
                              values.car
                                ? cars.find(
                                    (option) => option.value === values.car
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('car', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="car"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="worker"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MOTORISTA</BootstrapForm.Label>

                      <Field name="worker">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.worker && touched.worker
                                ? 'is-invalid'
                                : null
                            }
                            options={
                              // riskOptions
                              workers
                                .filter((item) => item.workerJobtypeId === 26)
                                .map((item) => ({
                                  label: item.workerId.nome,
                                  value: item.workerId,
                                }))
                            }
                            value={null}
                            onChange={(selectedOption) =>
                              setFieldValue('worker', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="worker"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="occurrence"
                      as={Col}
                      xs={12}
                      md={8}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        TIPO DE OCORRÊNCIA
                      </BootstrapForm.Label>

                      <Field name="occurrence">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.occurrence && touched.occurrence
                                ? 'is-invalid'
                                : null
                            }
                            options={occurrencestypes.map((item) => ({
                              value: item.id,
                              label: item.type,
                            }))}
                            value={
                              values.occurrence
                                ? occurrencestypes.find(
                                    (option) =>
                                      option.value === values.occurrence
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('occurrence', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="occurrence"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="data"
                      as={Col}
                      xs={12}
                      md={4}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        DATA DA OCORRÊNCIA
                      </BootstrapForm.Label>
                      <Field
                        xs={6}
                        className={
                          errors.data && touched.data ? 'is-invalid' : null
                        }
                        type="date"
                        name="data"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                      />
                      <ErrorMessage
                        name="data"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="obs"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        ESPECIFICAÇÕES DA OCORRÊNCIA
                      </BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.obs}
                        onChange={handleChange}
                        placeholder="Descreva mais detalhes da ocorrência"
                      />
                      <ErrorMessage
                        name="obs"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Button variant="primary" type="submit">
                    {isEditMode ? 'Save' : 'Add'}
                  </Button>
                  <Button variant="danger" type="reset">
                    Reset
                  </Button>
                </Form>
              )}
            </Formik>
          </Row>
        </div>
      </Container>
    </>
  );
}
