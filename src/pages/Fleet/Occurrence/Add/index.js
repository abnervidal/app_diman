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
import { useSelector } from 'react-redux';
import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';
import { primaryDarkColor } from '../../../../config/colors';
import PreviewMultipleImages from '../../../../components/PreviewMultipleImages';

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

export default function CarOccurrence({ data = null }) {
  const userId = useSelector((state) => state.auth.user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [cars, setCars] = useState([]);
  const [occurrencestypes, setOccurrencestypes] = useState([]);
  const [files, setFiles] = useState([]);
  const [initialValues, setInitialValues] = useState(data);

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

  const toFormData = ((f) => f(f))((h) => (f) => f((x) => h(h)(f)(x)))(
    (f) => (fd) => (pk) => (d) => {
      if (d instanceof Object) {
        Object.keys(d).forEach((k) => {
          const v = d[k];
          if (pk) k = `${pk}[${k}]`;
          if (
            v instanceof Object &&
            !(v instanceof Date) &&
            !(v instanceof File)
          ) {
            return f(fd)(k)(v);
          }
          fd.append(k, v);
        });
      }
      return fd;
    }
  )(new FormData())();

  const handleSubmit = async (values, resetForm) => {
    const formattedValues = {
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    Object.keys(formattedValues).forEach((key) => {
      if (formattedValues[key] === '') {
        delete formattedValues[key];
      }
    }); // LIMPANDO CHAVES `EMPTY STRINGS`

    formattedValues.UserId = userId;

    let formData;
    if (files.length > 0) {
      formData = toFormData(formattedValues);
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        formData.append('photos', file.file);
      }
    }

    try {
      setIsLoading(true);
      if (isEditMode) {
        await axios.put(`/cars/occurrences/${formattedValues.id}`, values);
        setIsLoading(false);
        toast.success(`Edição realizada com sucesso`);
      } else if (files.length > 0) {
        await axios.post(`/cars/occurrences/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFiles([]);
        resetForm();
        toast.success('Ocorrência Cadastrada Com Sucesso!');
      } else {
        await axios.post(`/cars/occurrences/`, formattedValues);
        resetForm();
        toast.success('Ocorrência Cadastrada Com Sucesso!');
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(true);
      // console.log(values);
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
              <span className="fs-5">
                {isEditMode ? 'EDITAR' : 'CADASTRAR'} OCORRÊNCIA
              </span>
            </Col>
          </Row>
          <Row className="pt-2">
            <Formik
              initialValues={initialValues || emptyValues}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                if (isEditMode) {
                  handleSubmit(values);
                } else {
                  handleSubmit(values, resetForm);
                }
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
                        // disabled={isEditMode.current}
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
                        // readOnly={isEditMode.current}
                      />
                      <ErrorMessage
                        name="obs"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>
                  <Row
                    className="text-center mt-3"
                    style={{ background: primaryDarkColor, color: 'white' }}
                  >
                    <span className="fs-6">REGISTROS FOTOGRÁFICOS</span>
                  </Row>

                  <Row>
                    <PreviewMultipleImages files={files} setFiles={setFiles} />
                  </Row>

                  <Row className="justify-content-center pt-2 pb-4">
                    {isEditMode.current ? null : (
                      <Col xs="auto" className="text-center">
                        <Button variant="warning" type="reset">
                          Limpar
                        </Button>
                      </Col>
                    )}
                    <Col xs="auto" className="text-center">
                      <Button variant="success" type="submit">
                        {isEditMode ? 'Editar' : 'Cadastrar'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </Row>
        </div>
      </Container>
    </>
  );
}
