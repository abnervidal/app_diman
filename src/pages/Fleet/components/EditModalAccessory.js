/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { FaRegEdit, FaTrashAlt } from 'react-icons/fa';
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
  const [categoryAccessory, setCategoryAccessory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();

  const { CarAccessorytypeId, payload, dimension, obs, id } = data;

  const initialValues = {
    CarAccessorytypeId,
    payload,
    dimension,
    obs,
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
        const response = await axios.get('/cars/accessories/types');
        setCategoryAccessory(response.data);
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
    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO E RETORNA PARA A LISTAGEM
      await axios.put(`/cars/accessories/${id}`, values);

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
            <FaRegEdit className="pb-1" /> EDIÇÃO: ACESSÓRIO
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
                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={4}
                    controlId="CarAccessorytypeId"
                    className="pb-3"
                  >
                    <Form.Label>ACESSÓRIO</Form.Label>

                    <Field name="CarAccessorytypeId">
                      {({ field }) => (
                        <Select
                          {...field}
                          inputId="CarAccessorytypeId"
                          options={categoryAccessory.map((item) => ({
                            value: item.id,
                            label: item.type,
                          }))}
                          value={
                            values.CarAccessorytypeId
                              ? categoryAccessory.find(
                                  (option) =>
                                    option.value === values.CarAccessorytypeId
                                )
                              : null
                          }
                          onChange={(selected) => {
                            setFieldValue('CarAccessorytypeId', selected.value);
                          }}
                          placeholder="Selecione a unidade"
                          onBlur={handleBlur}
                          isInvalid={
                            touched.CarAccessorytypeId &&
                            !!errors.CarAccessorytypeId
                          }
                          isValid={
                            touched.CarAccessorytypeId &&
                            !errors.CarAccessorytypeId
                          }
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="CarAccessorytypeId"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={4}
                    controlId="payload"
                    className="pb-3"
                  >
                    <Form.Label>CARGA ÚTIL</Form.Label>

                    <Field
                      type="text"
                      name="payload"
                      as={Form.Control}
                      value={values.payload}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      isInvalid={touched.payload && !!errors.payload}
                      isValid={touched.payload && !errors.payload}
                      placeholder="BC1D23"
                      onBlur={(e) => {
                        setFieldValue('payload', e.target.value.toUpperCase()); // UPPERCASE
                        handleBlur(e);
                      }}
                    />
                    <ErrorMessage
                      name="payload"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={4}
                    controlId="dimension"
                    className="pb-3"
                  >
                    <Form.Label>CAPACIDADE DE CARGA</Form.Label>

                    <Field
                      type="text"
                      name="dimension"
                      as={Form.Control}
                      value={values.dimension}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                      isInvalid={touched.dimension && !!errors.dimension}
                      isValid={touched.dimension && !errors.dimension}
                      placeholder="BC1D23"
                      onBlur={(e) => {
                        setFieldValue(
                          'dimension',
                          e.target.value.toUpperCase()
                        ); // UPPERCASE
                        handleBlur(e);
                      }}
                    />
                    <ErrorMessage
                      name="dimension"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group controlId="obs" as={Col} xs={12} className="pb-3">
                    <Form.Label>OBSERVAÇÕES</Form.Label>
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
