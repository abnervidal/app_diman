/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import Collapse, { Button, Row, Col, Form } from 'react-bootstrap';
import { IMaskInput } from 'react-imask';
import { toast } from 'react-toastify';

import * as yup from 'yup'; // RulesValidation
import { Formik } from 'formik'; // FormValidation
import Select from 'react-select';
import axios from '../../../../services/axios';
import { primaryDarkColor } from '../../../../config/colors';
import Loading from '../../../../components/Loading';

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [fuelOptions, setFuelOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  // const [contacttypes, setContacttypes] = useState([]);
  const template = {
    brand: '',
    model: '',
    alias: '',
    color: '',
    plate: '',
    renavan: '',
    year: '',
    obs: '',
    CartypeId: '',
    CarFueltypeId: '',
  };
  const [initialValues, setInitialValues] = useState(template);
  const [optionsExtra, setoptionsExtra] = useState(false);

  const schema = yup.object().shape({
    brand: yup.string().required('Requerido'),
    model: yup.string().required('Requerido'),
    alias: yup.string().required('Requerido'),
    color: yup.string().required('Requerido'),
    plate: yup.string().required('Requerido'),
    renavan: yup.number().required('Requerido'),
    year: yup.number().required('Requerido'),
    chassi: yup.string().required('Requerido'),
    fuel: yup.object().required('Requerido'),
    // obs: yup.string().required('Requerido'),
  });
  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/cars/fuel'); // erro na rota
        const responseCategoryOptions = await axios.get('/cars/types'); // erro na rota
        setFuelOptions(response.data);
        setCategoryOptions(responseCategoryOptions.data);
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

  const handleStore = async (values, resetForm) => {
    try {
      setIsLoading(true);
      console.log(values);

      await axios.post(`/cars/`, values);

      toast.success('Veículo Cadastrado Com Sucesso!');
      setIsLoading(false);
    } catch (err) {
      setIsLoading(true);
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
      <div className="bg-light border rounded pt-2 px-3">
        <Row>
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
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              handleStore(values, resetForm);
            }}
            enableReinitialize
          >
            {({
              handleSubmit,
              resetForm,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
            }) => (
              <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Row className="d-flex justify-content-center align-items-center pb-4">
                  <Col md={10} lg={8}>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={6}
                        controlId="CartypeId"
                        className="pb-3"
                      >
                        <Form.Label>CATEGORIA</Form.Label>
                        <Select
                          inputId="CartypeId"
                          options={categoryOptions.map((item) => ({
                            value: item.id,
                            label: item.type,
                          }))}
                          value={values.category}
                          onChange={(selected) => {
                            setFieldValue('CartypeId', selected.value);
                          }}
                          placeholder="Selecione a unidade"
                          onBlur={handleBlur}
                          isInvalid={touched.CartypeId && !!errors.CartypeId}
                          isValid={touched.CartypeId && !errors.CartypeId}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.CartypeId}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        md={6}
                        controlId="alias"
                        className="pb-3"
                      >
                        <Form.Label>APELIDO</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.alias}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.alias && !!errors.alias}
                          isValid={touched.alias && !errors.alias}
                          placeholder="Digite o apelido do veículo"
                          onBlur={(e) => {
                            setFieldValue(
                              'alias',
                              e.target.value.toUpperCase()
                            ); // UPPERCASE
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.alias}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        md={3}
                        controlId="brand"
                        className="pb-3"
                      >
                        <Form.Label>MARCA</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.brand}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.brand && !!errors.brand}
                          isValid={touched.brand && !errors.brand}
                          placeholder="Digite a marca do veículo"
                          onBlur={(e) => {
                            setFieldValue(
                              'brand',
                              e.target.value.toUpperCase()
                            ); // UPPERCASE
                            handleBlur(e);
                          }}
                        />

                        {/* {touched.name && !!errors.name ? (
                          <Badge bg="danger">{errors.name}</Badge>
                        ) : null} */}
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.brand}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        md={6}
                        controlId="model"
                        className="pb-3"
                      >
                        <Form.Label>MODELO</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.model}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.model && !!errors.model}
                          isValid={touched.model && !errors.model}
                          placeholder="Digite o modelo do veículo"
                          onBlur={(e) => {
                            setFieldValue(
                              'model',
                              e.target.value.toUpperCase()
                            ); // UPPERCASE
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.model}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        md={3}
                        controlId="color"
                        className="pb-3"
                      >
                        <Form.Label>COR</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.color}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.color && !!errors.color}
                          isValid={touched.color && !errors.color}
                          placeholder="Digite a cor do veículo"
                          onBlur={(e) => {
                            setFieldValue(
                              'color',
                              e.target.value.toUpperCase()
                            ); // UPPERCASE
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.color}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={6}
                        controlId="renavan"
                        className="pb-3"
                      >
                        <Form.Label>RENAVAN</Form.Label>
                        <Form.Control
                          type="number"
                          as={IMaskInput}
                          mask={Number}
                          value={values.renavan}
                          isInvalid={touched.renavan && !!errors.renavan}
                          placeholder="001234567890"
                          onBlur={handleBlur}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.renavan}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group
                        as={Col}
                        xs={6}
                        lg={3}
                        controlId="plate"
                        className="pb-3"
                      >
                        <Form.Label>PLACA</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.plate}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.plate && !!errors.plate}
                          isValid={touched.plate && !!errors.plate}
                          placeholder="ABC1D23"
                          onBlur={(e) => {
                            setFieldValue(
                              'plate',
                              e.target.value.toUpperCase()
                            );
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.plate}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={3}
                        controlId="year"
                        className="pb-3"
                      >
                        <Form.Label>ANO</Form.Label>
                        <Form.Control
                          type="number"
                          as={IMaskInput}
                          mask={Number}
                          value={values.year}
                          isInvalid={touched.year && !!errors.year}
                          placeholder="Digite o ano"
                          onBlur={handleBlur}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.year}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={6}
                        controlId="CarFueltypeId"
                        className="pb-3"
                      >
                        <Form.Label>COMBUSTÍVEL:</Form.Label>
                        <Select
                          inputId="CarFueltypeId"
                          options={fuelOptions.map((item) => ({
                            value: item.id,
                            label: item.type,
                          }))}
                          value={values.fuel}
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
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.CarFueltypeId}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={4}
                        controlId="chassi"
                        className="pb-3"
                      >
                        <Form.Label>CHASSI</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.chassi}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          isInvalid={touched.chassi && !!errors.chassi}
                          isValid={touched.chassi && !!errors.chassi}
                          placeholder="9BWHE21JX24060831"
                          onBlur={(e) => {
                            setFieldValue(
                              'chassi',
                              e.target.value.toUpperCase()
                            );
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.chassi}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Row>
                      <Form.Group xs={8} className="pb-3" controlId="obs">
                        <Form.Label>OBSERVAÇÕES:</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          type="text"
                          value={values.obs}
                          onChange={handleChange}
                          isInvalid={touched.obs && !!errors.obs}
                          // isValid={touched.obs && !errors.obs}
                          placeholder="Observaçoes diversas"
                          onBlur={(e) => {
                            setFieldValue('obs', e.target.value.toUpperCase()); // UPPERCASE
                            handleBlur(e);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.obs}
                        </Form.Control.Feedback>
                      </Form.Group>
                      {!optionsExtra ? (
                        <Col xs="auto" className="ps-1 pt-4">
                          <Button
                            type="submit"
                            variant="success"
                            onClick={() => setoptionsExtra(!optionsExtra)}
                            aria-controls="collapse-form"
                            aria-expanded={optionsExtra}
                            className="mt-2"
                          >
                            Mais Detalhes
                          </Button>
                        </Col>
                      ) : null}
                      {optionsExtra ? (
                        <>
                          <Form.Group
                            as={Col}
                            xs={6}
                            controlId="bodywork"
                            className="pb-3"
                          >
                            <Form.Label>CARROCERIA</Form.Label>
                            <Form.Control
                              type="text"
                              value={values.bodywork}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              isInvalid={touched.bodywork && !!errors.bodywork}
                              isValid={touched.bodywork && !!errors.bodywork}
                              placeholder="Carroceria do veículo"
                              onBlur={(e) => {
                                setFieldValue(
                                  'bodywork',
                                  e.target.value.toUpperCase()
                                );
                                handleBlur(e);
                              }}
                            />
                            <Form.Control.Feedback
                              tooltip
                              type="invalid"
                              style={{ position: 'static' }}
                            >
                              {errors.bodywork}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group
                            as={Col}
                            xs={6}
                            controlId="charge"
                            className="pb-3"
                          >
                            <Form.Label>CAPACIDADE DE CARGA</Form.Label>
                            <Form.Control
                              type="text"
                              value={values.charge}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              isInvalid={touched.charge && !!errors.charge}
                              isValid={touched.charge && !!errors.charge}
                              placeholder="Carga do veículo"
                              onBlur={(e) => {
                                setFieldValue(
                                  'charge',
                                  e.target.value.toUpperCase()
                                );
                                handleBlur(e);
                              }}
                            />
                            <Form.Control.Feedback
                              tooltip
                              type="invalid"
                              style={{ position: 'static' }}
                            >
                              {errors.charge}
                            </Form.Control.Feedback>
                          </Form.Group>

                          <Col xs="auto" className="ps-1 pt-4">
                            <Button
                              type="submit"
                              variant="success"
                              onClick={() => setoptionsExtra(!optionsExtra)}
                              aria-controls="collapse-form"
                              aria-expanded={optionsExtra}
                              className="mt-2"
                            >
                              Menos Detalhes
                            </Button>
                          </Col>
                        </>
                      ) : null}
                    </Row>
                  </Col>
                </Row>

                <Row className="d-flex justify-content-center align-items-center">
                  <Col
                    xs={12}
                    className="text-center"
                    style={{ background: primaryDarkColor, color: 'white' }}
                  >
                    <span className="fs-6">CONTRATOS</span>
                  </Col>
                </Row>

                <Row className="justify-content-center pt-2 pb-4">
                  <>
                    <Col xs="auto" className="text-center">
                      <Button
                        variant="warning"
                        onClick={() => {
                          resetForm();
                        }}
                      >
                        Limpar
                      </Button>
                    </Col>
                    <Col xs="auto" className="text-center">
                      <Button variant="success" type="submit">
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
    </>
  );
}
