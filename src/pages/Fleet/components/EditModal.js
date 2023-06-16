/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { FaRegEdit } from 'react-icons/fa';
import { Button, Modal, Row, Col, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';

import * as yup from 'yup'; // RulesValidation
import { Formik, Field, ErrorMessage } from 'formik'; // FormValidation
import Select from 'react-select';
import { initial } from 'lodash';
import axios from '../../../services/axios';
import {
  primaryDarkColor,
  body1Color,
  body2Color,
} from '../../../config/colors';
import Loading from '../../../components/Loading';

const formatGroupLabel = (data) => (
  <Col className="d-flex justify-content-between">
    <span>{data.label}</span>
    <Badge bg="secondary">{data.options.length}</Badge>
  </Col>
);

export default function EditModal({ show, handleClose, data, handleSave }) {
  const userId = useSelector((state) => state.auth.user.id);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [fuelOptions, setFuelOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();

  const {
    brand,
    model,
    alias,
    color,
    plate,
    renavan,
    year,
    chassi,
    obs,
    CartypeId,
    CarFueltypeId,
    id,
  } = data;

  const initialValues = {
    brand,
    model,
    alias,
    color,
    plate,
    renavan,
    year,
    chassi,
    obs,
    CartypeId,
    CarFueltypeId,
  };

  const schema = yup.object().shape();

  useEffect(() => {
    // Focus on inputRef
    if (inputRef.current) {
      inputRef.current.focus();
    }

    async function getUsersData() {
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

    getUsersData();
  }, []);

  const handleUpdate = async (values) => {
    // const formattedValues = {
    //   ...Object.fromEntries(
    //     Object.entries(values).filter(([_, v]) => v != null)
    //   ),
    // }; // LIMPANDO CHAVES NULL E UNDEFINED

    // Object.keys(formattedValues).forEach((key) => {
    //   if (formattedValues[key] === '') {
    //     delete formattedValues[key];
    //   }
    // }); // LIMPANDO CHAVES `EMPTY STRINGS`

    // formattedValues.userId = userId;
    // formattedValues.workerId = formattedValues.workerId?.value;
    // formattedValues.authorizedBy = formattedValues.authorizedBy?.value;
    // formattedValues.propertyId = formattedValues.propertyId?.value;
    // formattedValues.buildingId = formattedValues.buildingId?.value;

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO E RETORNA PARA A LISTAGEM
      await axios.put(`/cars/${id}`, values);

      setIsLoading(false);
      toast.success(`Edição realizada com sucesso`);

      handleSave();
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  // const formatReq = (req) => {
  //   if (!req) return;
  //   const currentYear = new Date().getFullYear();
  //   return req.includes('/') ? req : `${req}/${currentYear}`;
  // };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="xl"
    >
      {/* <Modal.Header closeButton>
        <Modal.Title>Editar ... </Modal.Title>
      </Modal.Header> */}
      {/* <Modal.Body> */}
      <Loading isLoading={isLoading} />
      <Row className="bg-light border rounded d-flex justify-content-center pt-2">
        <Row
          className="px-0 mx-0 py-2 text-center"
          style={{ background: primaryDarkColor, color: 'white' }}
        >
          <span className="fs-5">
            <FaRegEdit className="pb-1" /> EDIÇÃO: VEÍCULO
          </span>
        </Row>
        <Row className="px-0 pt-2">
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values) => {
              handleUpdate(values);
            }}
            // enableReinitialize
          >
            {({
              submitForm,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
              setFieldTouched,
            }) => (
              <Form noValidate autoComplete="off">
                <Row>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={6}
                    controlId="CartypeId"
                    className="pb-3"
                  >
                    <Form.Label>CATEGORIA</Form.Label>

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
                          value={values.CartypeId}
                          onChange={(selectedOption) =>
                            setFieldValue('CartypeId', selectedOption.value)
                          }
                          placeholder="Selecione a unidade"
                          onBlur={handleBlur}
                          isInvalid={touched.CartypeId && !!errors.CartypeId}
                          isValid={touched.CartypeId && !errors.CartypeId}
                          isDisabled
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="CartypeId"
                      component="div"
                      className="invalid-feedback"
                    />
                    {touched.CartypeId && !!errors.CartypeId ? (
                      <Badge bg="danger">{errors.CartypeId}</Badge>
                    ) : null}
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    md={6}
                    controlId="alias"
                    className="pb-3"
                  >
                    <Form.Label>APELIDO</Form.Label>

                    <Field
                      type="text"
                      name="alias"
                      as={Form.Control}
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
                  </Form.Group>
                  {/* <Col className="pb-3">
                    <Form.Group>
                      <Form.Label>AUTORIZADO POR:</Form.Label>
                      <Select
                        inputId="authorizedBy"
                        options={users.map((user) => ({
                          value: user.id,
                          label: user.name,
                        }))}
                        value={values.authorizedBy}
                        onChange={(selected) => {
                          setFieldValue('authorizedBy', selected);
                        }}
                        placeholder="Selecione o responsável"
                        onBlur={handleBlur}
                        isDisabled
                      />
                      {touched.authorizedBy && !!errors.authorizedBy ? (
                        <Badge bg="danger">{errors.authorizedBy}</Badge>
                      ) : null}
                    </Form.Group>
                  </Col> */}
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group
                    as={Col}
                    xs={12}
                    md={3}
                    controlId="brand"
                    className="pb-3"
                  >
                    <Form.Label>MARCA</Form.Label>

                    <Field
                      type="text"
                      name="brand"
                      as={Form.Control}
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
                      isDisabled
                    />
                    <ErrorMessage
                      name="brand"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    md={6}
                    controlId="model"
                    className="pb-3"
                  >
                    <Form.Label>MODELO</Form.Label>

                    <Field
                      type="text"
                      name="model"
                      as={Form.Control}
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
                      isDisabled
                    />
                    <ErrorMessage
                      name="model"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    md={3}
                    controlId="color"
                    className="pb-3"
                  >
                    <Form.Label>COR</Form.Label>

                    <Field
                      type="text"
                      name="color"
                      as={Form.Control}
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
                  </Form.Group>
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={6}
                    controlId="renavan"
                    className="pb-3"
                  >
                    <Form.Label>RENAVAN</Form.Label>

                    <Field
                      type="number"
                      name="renavan"
                      as={Form.Control}
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
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    xs={6}
                    lg={3}
                    controlId="plate"
                    className="pb-3"
                  >
                    <Form.Label>PLACA</Form.Label>

                    <Field
                      type="text"
                      name="plate"
                      as={Form.Control}
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
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={3}
                    controlId="year"
                    className="pb-3"
                  >
                    <Form.Label>ANO</Form.Label>

                    <Field
                      type="number"
                      name="year"
                      as={Form.Control}
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
                  </Form.Group>
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={7}
                    controlId="CarFueltypeId"
                    className="pb-3"
                  >
                    <Form.Label>COMBUSTÍVEL</Form.Label>

                    <Field name="CarFueltypeId">
                      {({ field }) => (
                        <Select
                          {...field}
                          inputId="CarFueltypeId"
                          options={fuelOptions.map((item) => ({
                            value: item.id,
                            label: item.type,
                          }))}
                          value={values.CarFueltypeId}
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
                          isDisabled
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="CarFueltypeId"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={5}
                    controlId="chassi"
                    className="pb-3"
                  >
                    <Form.Label>CHASSI</Form.Label>

                    <Field
                      type="text"
                      name="chassi"
                      as={Form.Control}
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
                      isDisabled
                    />
                    <ErrorMessage
                      name="chassi"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group controlId="obs" as={Col} xs={12} className="pb-3">
                    <Form.Label>ESPECIFICAÇÕES DA OCORRÊNCIA</Form.Label>
                    <Form.Control
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
                  </Form.Group>
                </Row>

                <hr />

                <Row className="justify-content-center">
                  <Col xs="auto" className="text-center pt-2 pb-4">
                    <Button type="reset" variant="danger" onClick={handleClose}>
                      Cancelar
                    </Button>
                  </Col>
                  <Col xs="auto" className="text-center pt-2 pb-4">
                    <Button
                      variant="success"
                      onClick={(e) => {
                        submitForm(e);
                      }}
                    >
                      Salvar
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
      </Row>
      {/* </Modal.Body> */}
      {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
        <Button variant="primary">Entendido</Button>
      </Modal.Footer> */}
    </Modal>
  );
}
