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

import { IMaskInput } from 'react-imask';
import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';
import { primaryDarkColor } from '../../../../config/colors';
import PreviewMultipleImages from '../../../../components/PreviewMultipleImages';

const emptyValues = {
  brand: '',
  model: '',
  alias: '',
  color: '',
  plate: '',
  renavan: '',
  year: '',
  chassi: '',
  obs: '',
  CartypeId: '',
  CarFueltypeId: '',
};

const validationSchema = Yup.object().shape({});

export default function CarOccurrence({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fuelOptions, setFuelOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [files, setFiles] = useState([]);

  // const [workers, setWorkers] = useState([]);
  // const [cars, setCars] = useState([]);
  // const [occurrencestypes, setOccurrencestypes] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/cars/fuel');
        const response2 = await axios.get('/cars/types');
        setFuelOptions(response.data);
        setCategoryOptions(response2.data);

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
      console.log(values);

      if (files.length > 0) {
        await axios.post(`/cars/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // for (const pair of formData.entries()) {
        //   console.log(`${pair[0]} - ${pair[1]}`);
        // }
      } else {
        await axios.post(`/cars/`, formattedValues);
      }
      setIsLoading(false);
      resetForm();
      toast.success('Veículo Cadastrado Com Sucesso!');
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
              <span className="fs-5">CADASTRO DE VEÍCULOS</span>
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
                      as={Col}
                      xs={12}
                      lg={6}
                      controlId="CartypeId"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CATEGORIA</BootstrapForm.Label>

                      <Field name="CartypeId">
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId="CartypeId"
                            className={
                              errors.CartypeId && touched.CartypeId
                                ? 'is-invalid'
                                : null
                            }
                            options={categoryOptions.map((item) => ({
                              value: item.id,
                              label: item.type,
                            }))}
                            // styles={}
                            value={
                              values.CartypeId
                                ? categoryOptions.find(
                                    (option) =>
                                      option.value === values.CartypeId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('CartypeId', selectedOption.value)
                            }
                            placeholder="Selecione a unidade"
                            onBlur={handleBlur}
                            isInvalid={touched.CartypeId && !!errors.CartypeId}
                            isValid={touched.CartypeId && !errors.CartypeId}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="CartypeId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={6}
                      controlId="alias"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>APELIDO</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="alias"
                        as={BootstrapForm.Control}
                        value={values.alias}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.alias && !!errors.alias}
                        isValid={touched.alias && !errors.alias}
                        placeholder="Digite o apelido do veículo"
                        onBlur={(e) => {
                          setFieldValue('alias', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="alias"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={3}
                      controlId="brand"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MARCA</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="brand"
                        as={BootstrapForm.Control}
                        value={values.brand}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.brand && !!errors.brand}
                        isValid={touched.brand && !errors.brand}
                        placeholder="Digite a marca do veículo"
                        onBlur={(e) => {
                          setFieldValue('brand', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="brand"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={6}
                      controlId="model"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MODELO</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="model"
                        as={BootstrapForm.Control}
                        value={values.model}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.model && !!errors.model}
                        isValid={touched.model && !errors.model}
                        placeholder="Digite o modelo do veículo"
                        onBlur={(e) => {
                          setFieldValue('model', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="model"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={3}
                      controlId="color"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>COR</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="color"
                        as={BootstrapForm.Control}
                        value={values.color}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.color && !!errors.color}
                        isValid={touched.color && !errors.color}
                        placeholder="Digite a marca do veículo"
                        onBlur={(e) => {
                          setFieldValue('color', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="color"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={6}
                      controlId="renavan"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>RENAVAN</BootstrapForm.Label>

                      <Field
                        type="number"
                        name="renavan"
                        as={BootstrapForm.Control}
                        // as={IMaskInput}
                        mask={Number}
                        value={values.renavan}
                        isInvalid={touched.renavan && !!errors.renavan}
                        placeholder="001234567890"
                        onBlur={handleBlur}
                        onAccept={(value, mask) => {
                          setFieldValue(mask.el.input.id, mask.unmaskedValue);
                        }}
                      />
                      <ErrorMessage
                        name="renavan"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={6}
                      lg={3}
                      controlId="plate"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>PLACA</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="plate"
                        as={BootstrapForm.Control}
                        value={values.plate}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.plate && !!errors.plate}
                        isValid={touched.plate && !errors.plate}
                        placeholder="BC1D23"
                        onBlur={(e) => {
                          setFieldValue('plate', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="plate"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={3}
                      controlId="year"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>ANO</BootstrapForm.Label>

                      <Field
                        type="number"
                        name="year"
                        as={BootstrapForm.Control}
                        // as={IMaskInput}
                        mask={Number}
                        value={values.year}
                        isInvalid={touched.year && !!errors.year}
                        placeholder="Digite o ano"
                        onBlur={handleBlur}
                        onAccept={(value, mask) => {
                          setFieldValue(mask.el.input.id, mask.unmaskedValue);
                        }}
                      />
                      <ErrorMessage
                        name="year"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={7}
                      controlId="CarFueltypeId"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>COMBUSTÍVEL</BootstrapForm.Label>

                      <Field name="CarFueltypeId">
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId="CarFueltypeId"
                            options={fuelOptions.map((item) => ({
                              value: item.id,
                              label: item.type,
                            }))}
                            value={
                              values.CartypeId
                                ? fuelOptions.find(
                                    (option) =>
                                      option.value === values.CarFueltypeId
                                  )
                                : null
                            }
                            onChange={(selected) => {
                              setFieldValue('CarFueltypeId', selected.value);
                            }}
                            placeholder="Selecione a unidade"
                            onBlur={handleBlur}
                            isInvalid={
                              touched.CarFueltypeId && !!errors.CarFueltypeId
                            }
                            isValid={
                              touched.CarFueltypeId && !errors.CarFueltypeId
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="CarFueltypeId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={5}
                      controlId="chassi"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CHASSI</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="chassi"
                        as={BootstrapForm.Control}
                        value={values.chassi}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.chassi && !!errors.chassi}
                        isValid={touched.chassi && !errors.chassi}
                        placeholder="BC1D23"
                        onBlur={(e) => {
                          setFieldValue('chassi', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="chassi"
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
                      <BootstrapForm.Label>OBSERVAÇÕES</BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.obs}
                        onChange={handleChange}
                        isInvalid={touched.obs && !!errors.obs}
                        placeholder="Observações do veículo"
                        onBlur={(e) => {
                          setFieldValue('obs', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
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
                    <>
                      <Col xs="auto" className="text-center">
                        <Button variant="warning" type="reset">
                          Limpar
                        </Button>
                      </Col>
                      <Col xs="auto" className="text-center">
                        <Button
                          // variant="success"
                          type="submit"
                          // onClick={submitForm}
                        >
                          Cadastrar
                        </Button>
                      </Col>
                    </>
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
