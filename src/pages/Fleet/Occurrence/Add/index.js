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
  CarId: '',
  WorkerId: '',
  CarOccurrencetypeId: '',
  data: '',
  obs: '',
};

const validationSchema = Yup.object().shape({
  CarId: Yup.number().required('Necessário selecionar o veículo!'),
  WorkerId: Yup.string().required('Necessário selecionar o motorista!'),
  CarOccurrencetypeId: Yup.number().required(
    'Necessário selecionar o tipo de ocorrência!'
  ),
  data: Yup.date().required('Necessário selecionar a data da ocorrência!'),
});

export default function CarOccurrence({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [cars, setCars] = useState([]);
  const [occurrencestypes, setOccurrencestypes] = useState([]);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/actives/');
        const response2 = await axios.get('/cars/');
        const response3 = await axios.get('/cars/occurrences/types');

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

  const handleSubmit = async (values, resetForm) => {
    try {
      setIsLoading(true);
      console.log(values);

      await axios.post(`/cars/occurrences/`, values);
      setIsLoading(false);
      resetForm();
      toast.success('Ocorrência Cadastrada Com Sucesso!');
    } catch (err) {
      setIsLoading(true);
      console.log(values);
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
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
              <span className="fs-5">ADICIONAR OCORRÊNCIA</span>
            </Col>
          </Row>
          <Row className="pt-2">
            <Formik
              initialValues={initialValues || emptyValues}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                handleSubmit(values, resetForm);
              }}
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
                      controlId="CarId"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CARRO</BootstrapForm.Label>

                      <Field name="CarId">
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId="CarId"
                            className={
                              errors.CarId && touched.CarId
                                ? 'is-invalid'
                                : null
                            }
                            options={cars.map((item) => ({
                              value: item.id,
                              label: `${item.brand}   ${item.model}  -  ${item.plate}`,
                            }))}
                            // styles={}
                            value={
                              values.CarId
                                ? cars.find(
                                    (option) => option.value === values.CarId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('CarId', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="CarId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="WorkerId"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MOTORISTA</BootstrapForm.Label>

                      <Field name="WorkerId">
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId="WorkerId"
                            className={
                              errors.WorkerId && touched.WorkerId
                                ? 'is-invalid'
                                : null
                            }
                            options={workers
                              .filter(
                                (item) =>
                                  item.WorkerContracts[0].WorkerJobtypeId === 26
                              )
                              .map((item) => ({
                                label: item.name,
                                value: item.id,
                              }))}
                            value={workers
                              .filter(
                                (item) =>
                                  item.WorkerContracts[0].WorkerJobtypeId === 26
                              )
                              .map((item) => ({
                                label: item.name,
                                value: item.id,
                              }))
                              .find((item) => item.value === values.WorkerId)}
                            onChange={(selectedOption) =>
                              setFieldValue('WorkerId', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="WorkerId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="CarOccurrencetypeId"
                      as={Col}
                      xs={12}
                      md={8}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        TIPO DE OCORRÊNCIA
                      </BootstrapForm.Label>

                      <Field name="CarOccurrencetypeId">
                        {({ field }) => (
                          <Select
                            inputId="CarOccurrencetypeId"
                            {...field}
                            className={
                              errors.CarOccurrencetypeId &&
                              touched.CarOccurrencetypeId
                                ? 'is-invalid'
                                : null
                            }
                            options={occurrencestypes.map((item) => ({
                              value: item.id,
                              label: item.type,
                            }))}
                            value={
                              values.CarOccurrencetypeId
                                ? occurrencestypes.find(
                                    (option) =>
                                      option.value ===
                                      values.CarOccurrencetypeId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue(
                                'CarOccurrencetypeId',
                                selectedOption.value
                              )
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="CarOccurrencetypeId"
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
