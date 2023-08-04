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
  milage: '',
  date: '',
  hourmeter: '',
  internal: '',
  external: '',
  obs: '',
};

const riskOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const validationSchema = Yup.object().shape({
  CarId: Yup.number().required('Necessário selecionar o veículo!'),
  WorkerId: Yup.number().required('Necessário selecionar o motorista!'),
  milage: Yup.number().required('Necessário inserir a quilometragem!'),
  date: Yup.date().required('Necessário selecionar a data da vistoria!'),
});

export default function CarInspection({ data = null }) {
  const userId = useSelector((state) => state.auth.user.id);
  // const [initialData, setInitialData] = useState(emptyValues);
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [cars, setCars] = useState([]);
  const [files, setFiles] = useState([]);
  const [initialValues, setInitialValues] = useState(data);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/cars/');
        const response2 = await axios.get('/workers/actives/');
        setCars(response.data);
        setWorkers(response2.data);
        setIsLoading(false);
        console.log(2);
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
        await axios.put(`/cars/inspections/${formattedValues.id}`, values);
        setIsLoading(false);
        toast.success(`Edição realizada com sucesso`);
      } else if (files.length > 0) {
        await axios.post(`/cars/inspections/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFiles([]);
        resetForm();
        toast.success('Vistoria Cadastrada Com Sucesso!');
      } else {
        await axios.post(`/cars/inspections`, formattedValues);
        resetForm();
        toast.success('Vistoria Cadastrada Com Sucesso!');
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
    // console.log(values);
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
                {isEditMode ? 'EDITAR' : 'CADASTRAR'} VISTORIA
              </span>
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
                      controlId="milage"
                      as={Col}
                      xs={12}
                      md={3}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>QUILOMETRAGEM</BootstrapForm.Label>

                      <Field
                        type="number"
                        as={BootstrapForm.Control}
                        // mask={Number}
                        value={values.milage}
                        isInvalid={touched.milage && !!errors.milage}
                        placeholder="100000"
                        // onBlur={handleBlur}
                        // onAccept={(value, mask) => {
                        //   setFieldValue(mask.el.input.id, mask.unmaskedValue);
                        // }}
                      />

                      <ErrorMessage
                        name="milage"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      controlId="date"
                      as={Col}
                      xs={12}
                      md={3}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        DATA DA VISTORIA
                      </BootstrapForm.Label>

                      <Field
                        xs={6}
                        className={
                          errors.date && touched.date ? 'is-invalid' : null
                        }
                        type="date"
                        name="date"
                        as={BootstrapForm.Control}
                        placeholder="Data"
                        // disabled={isEditMode.current}
                      />

                      <ErrorMessage
                        name="date"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="WorkerId"
                      as={Col}
                      xs={12}
                      md={7}
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

                    <BootstrapForm.Group
                      controlId="hourmeter"
                      as={Col}
                      xs={12}
                      md={5}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>HORIMETRO</BootstrapForm.Label>

                      <Field
                        type="number"
                        as={BootstrapForm.Control}
                        // mask={Number}
                        value={values.hourmeter}
                        isInvalid={touched.hourmeter && !!errors.hourmeter}
                        placeholder="100000"
                        // onBlur={handleBlur}
                        // onAccept={(value, mask) => {
                        //   setFieldValue(mask.el.input.id, mask.unmaskedValue);
                        // }}
                      />

                      <ErrorMessage
                        name="hourmeter"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">INTERNA</span>
                    </Col>
                    <BootstrapForm.Group
                      controlId="internal"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        AVARIAS INTERNAS
                      </BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.internal}
                        onChange={handleChange}
                        placeholder="Descreva detalhes importantes da vistoria"
                        // readOnly={isEditMode.current}
                      />
                      <ErrorMessage
                        name="internal"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">EXTERNA</span>
                    </Col>
                    <BootstrapForm.Group
                      controlId="external"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        AVARIAS EXTERNAS
                      </BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.external}
                        onChange={handleChange}
                        placeholder="Descreva detalhes importantes da vistoria"
                        // readOnly={isEditMode.current}
                      />
                      <ErrorMessage
                        name="external"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">OBSERVAÇÕES</span>
                    </Col>

                    <BootstrapForm.Group
                      controlId="obs"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        OBSERVAÇÕES IMPORTANTES DA VISTORIA
                      </BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.obs}
                        onChange={handleChange}
                        placeholder="Descreva detalhes importantes da vistoria"
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
