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
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();

  const { obs, CarStatustypeId, CarId } = data;

  const initialValues = {
    CarId,
    CarStatustypeId,
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
        const response = await axios.get('/cars/statuses/types');
        setCategoryOptions(response.data);
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

    formattedValues.CarId = data.id;
    formattedValues.UserId = userId;
    // formattedValues.workerId = formattedValues.workerId?.value;
    // formattedValues.authorizedBy = formattedValues.authorizedBy?.value;
    // formattedValues.propertyId = formattedValues.propertyId?.value;
    // formattedValues.buildingId = formattedValues.buildingId?.value;

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO E RETORNA PARA A LISTAGEM
      await axios.post(`/cars/statuses/`, formattedValues);

      setIsLoading(false);
      toast.success(`Status atualizado com sucesso`);

      handleSave();
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="xl"
    >
      <Loading isLoading={isLoading} />
      <Row className="bg-light border rounded d-flex justify-content-center pt-2">
        <Row
          className="px-0 mx-0 py-2 text-center"
          style={{ background: primaryDarkColor, color: 'white' }}
        >
          <span className="fs-5">
            <FaRegEdit className="pb-1" /> EDIÇÃO: STATUS
          </span>
        </Row>
        <Row className="px-0 pt-2">
          <Form.Label>
            VEÍCULO: {data.brand} {data.model} - {data.color} {data.plate}
          </Form.Label>
        </Row>
        <Row className="px-0 pt-2">
          {/* {JSON.stringify(data)} */}
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
                    lg={12}
                    controlId="CarStatustypeId"
                    className="pb-3"
                  >
                    <Form.Label>STATUS DO CARRO</Form.Label>

                    <Field name="CarStatustypeId">
                      {({ field }) => (
                        <Select
                          {...field}
                          inputId="CarStatustypeId"
                          options={categoryOptions.map((item) => ({
                            value: item.id,
                            label: item.type,
                          }))}
                          value={
                            values.CarStatustypeId
                              ? categoryOptions.find(
                                  (option) =>
                                    option.value === values.CarStatustypeId
                                )
                              : null
                          }
                          onChange={(selected) => {
                            setFieldValue('CarStatustypeId', selected.value);
                          }}
                          placeholder="Selecione a unidade"
                          onBlur={handleBlur}
                          isInvalid={
                            touched.CarStatustypeId && !!errors.CarStatustypeId
                          }
                          isValid={
                            touched.CarStatustypeId && !errors.CarStatustypeId
                          }
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="CarStatustypeId"
                      component="div"
                      className="invalid-feedback"
                    />
                  </Form.Group>
                </Row>

                <Row className="d-flex justify-content-center align-items-top">
                  <Form.Group controlId="obs" as={Col} xs={12} className="pb-3">
                    <Form.Label>ESPECIFICAÇÕES</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      type="text"
                      value={values.CarStatuses?.obs}
                      onChange={handleChange}
                      placeholder="Especificações"
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
