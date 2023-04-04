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
  reqMaintenance: '',
  title: '',
  description: '',
  start: '',
  end: '',
  place: '',
  propertySipacId: '',
  buildingSipacId: '',
  extraActivity: null,
  WorkerTasktype: '',
  WorkerTaskItem: [],
  WorkerTaskServant: [],
};

const riskOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const validationSchema = Yup.object().shape({
  reqMaintenance: Yup.string().required('Número de requisição obrigatória'),
  description: Yup.string().required('Description is required'),
  // riskLevel: Yup.string().required('Risk level is required'),
});

export default function RiskTaskForm({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [servants, setServants] = useState([]);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      // const workersOp = [];
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/actives');
        const response2 = await axios.get('/users');

        // const workersJobs = response.data
        //   .filter(
        //     (value, index, arr) =>
        //       arr.findIndex((item) => item.job === value.job) === index
        //   )
        //   .map((value) => value.job); // RETORNA OS DIFERENTES TRABALHOS

        // workersJobs.forEach((value) => {
        //   workersOp.push([
        //     value,
        //     response.data.filter((item) => item.job === value),
        //   ]);
        // });

        setWorkers(response.data);
        setServants(response2.data);

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
                      controlId="reqMaintenance"
                      as={Col}
                      xs={12}
                      md={3}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Req. Manutenção</BootstrapForm.Label>
                      <Field
                        xs={6}
                        className={
                          errors.reqMaintenance && touched.reqMaintenance
                            ? 'is-invalid'
                            : null
                        }
                        type="text"
                        name="reqMaintenance"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                      />
                      <ErrorMessage
                        name="reqMaintenance"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="WorkerTasktype"
                      as={Col}
                      xs={12}
                      md={3}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Tipo</BootstrapForm.Label>

                      <Field name="WorkerTasktype">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.WorkerTasktype && touched.WorkerTasktype
                                ? 'is-invalid'
                                : null
                            }
                            options={riskOptions}
                            value={
                              values.WorkerTasktype
                                ? riskOptions.find(
                                    (option) =>
                                      option.value === values.WorkerTasktype
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue(
                                'WorkerTasktype',
                                selectedOption.value
                              )
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="riskLevel"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="title"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Título</BootstrapForm.Label>
                      <Field
                        className={
                          errors.title && touched.title ? 'is-invalid' : null
                        }
                        type="text"
                        name="title"
                        as={BootstrapForm.Control}
                      />
                      <ErrorMessage
                        name="title"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="place"
                      as={Col}
                      xs={12}
                      md={6}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Local</BootstrapForm.Label>
                      <Field
                        className={
                          errors.place && touched.place ? 'is-invalid' : null
                        }
                        type="text"
                        name="place"
                        as={BootstrapForm.Control}
                      />
                      <ErrorMessage
                        name="place"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="start"
                      as={Col}
                      xs={12}
                      md={2}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Data início</BootstrapForm.Label>
                      <Field
                        xs={6}
                        className={
                          errors.start && touched.start ? 'is-invalid' : null
                        }
                        type="date"
                        name="start"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                      />
                      <ErrorMessage
                        name="start"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="end"
                      as={Col}
                      xs={12}
                      md={2}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Data final</BootstrapForm.Label>
                      <Field
                        xs={6}
                        className={
                          errors.end && touched.end ? 'is-invalid' : null
                        }
                        type="date"
                        name="end"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                      />
                      <ErrorMessage
                        name="end"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="extraActivity"
                      as={Col}
                      xs={12}
                      md={2}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Atividade extra</BootstrapForm.Label>
                      <Field
                        xs={6}
                        // className={
                        //   errors.extraActivity && touched.extraActivity
                        //     ? 'is-invalid'
                        //     : null
                        // }
                        type="switch"
                        name="extraActivity"
                        as={BootstrapForm.Check}
                        placeholder="Código"
                        // className="border"
                      />
                      <ErrorMessage
                        name="extraActivity"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="description"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Descrição</BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={2}
                        type="text"
                        value={values.description}
                        onChange={handleChange}
                        placeholder="Descrição sucinta da tarefa"
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="propertySipacId"
                      as={Col}
                      xs={12}
                      md={4}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Imóvel</BootstrapForm.Label>

                      <Field name="propertySipacId">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.propertySipacId && touched.propertySipacId
                                ? 'is-invalid'
                                : null
                            }
                            options={riskOptions}
                            value={
                              values.propertySipacId
                                ? riskOptions.find(
                                    (option) =>
                                      option.value === values.propertySipacId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue(
                                'propertySipacId',
                                selectedOption.value
                              )
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="propertySipacId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="buildingSipacId"
                      as={Col}
                      xs={12}
                      md={8}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        Instalação Física
                      </BootstrapForm.Label>

                      <Field name="buildingSipacId">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.buildingSipacId && touched.buildingSipacId
                                ? 'is-invalid'
                                : null
                            }
                            options={riskOptions}
                            value={
                              values.buildingSipacId
                                ? riskOptions.find(
                                    (option) =>
                                      option.value === values.buildingSipacId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue(
                                'buildingSipacId',
                                selectedOption.value
                              )
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="buildingSipacId"
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
                      <span className="fs-6">SERVIDORES RELACIONADOS</span>
                    </Col>

                    <FieldArray name="WorkerTaskServant" className="p-0">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <>
                            <Row className="d-flex justify-content-center align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                              <Col xs="12" md="auto" className="ps-0 pe-2">
                                PESQUISA DE SERVIDOR:
                              </Col>
                              <Col className="p-0">
                                {' '}
                                <Select
                                  inputId="searchServant"
                                  options={servants
                                    .filter(
                                      (servant) =>
                                        servant.UserPositions.length > 0
                                    )
                                    .filter(
                                      (item) =>
                                        !values.WorkerTaskServant.find(
                                          (element) => element.id === item.id
                                        )
                                    )
                                    .map((item) => ({
                                      label: item.name,
                                      value: item,
                                    }))}
                                  // options={inventoryData.map((material) => ({
                                  //   value: material,
                                  //   label: `(${material.materialId}) ${material.name} - ${material.unit}`,
                                  // }))}
                                  value={null}
                                  // onChange={(selected, action) => {
                                  //   handlePushItem(
                                  //     push,
                                  //     selected,
                                  //     values.MaterialReserveItems
                                  //   );
                                  //   setFieldValue('searchMaterial', '');
                                  // }}
                                  placeholder="Selecione o servidor"
                                  // onBlur={() =>
                                  //   setFieldValue('searchMaterial', '')
                                  // }
                                  escapeClearsValue
                                  onChange={(e) => {
                                    console.log(e.value);
                                    push(e.value);
                                  }}
                                  // filterOption={filterOptions}
                                />
                              </Col>
                            </Row>
                            <Row className="d-flex justify-content-center align-items-center">
                              <Col xs={12}>
                                {values.WorkerTaskServant?.length > 0 &&
                                  values.WorkerTaskServant?.map(
                                    (item, index) => (
                                      <>
                                        <Row className="d-block d-lg-none">
                                          <Col className="fw-bold">
                                            Servidor nº {index + 1}
                                          </Col>
                                        </Row>
                                        <Row
                                          key={item.id}
                                          className="d-flex p-0 m-0 border-bottom"
                                        >
                                          <BootstrapForm.Group
                                            as={Col}
                                            xs={12}
                                            lg={1}
                                            controlId={`WorkerTaskServant[${index}].id`}
                                            className="border-0 m-0 p-0"
                                          >
                                            {index === 0 ? (
                                              <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                                ID
                                              </BootstrapForm.Label>
                                            ) : null}
                                            <Field
                                              type="text"
                                              plaintext
                                              readOnly
                                              value={item.id}
                                              size="sm"
                                              className="p-0 m-0 ps-2"
                                              tabindex="-1"
                                              as={BootstrapForm.Control}
                                            />
                                          </BootstrapForm.Group>

                                          <BootstrapForm.Group
                                            as={Col}
                                            xs={12}
                                            lg={6}
                                            controlId={`WorkerTaskServant[${index}].name`}
                                            className="border-0 m-0 p-0"
                                          >
                                            {index === 0 ? (
                                              <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                                Nome
                                              </BootstrapForm.Label>
                                            ) : null}
                                            <Field
                                              type="text"
                                              plaintext
                                              readOnly
                                              value={item.name}
                                              size="sm"
                                              className="p-0 m-0 ps-2"
                                              tabindex="-1"
                                              as={BootstrapForm.Control}
                                            />
                                          </BootstrapForm.Group>

                                          <BootstrapForm.Group
                                            as={Col}
                                            xs={12}
                                            lg={4}
                                            controlId={`WorkerTaskServant[${index}].name`}
                                            className="border-0 m-0 p-0"
                                          >
                                            {index === 0 ? (
                                              <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                                Cargo
                                              </BootstrapForm.Label>
                                            ) : null}
                                            <Field
                                              type="text"
                                              plaintext
                                              readOnly
                                              value={
                                                item.UserPositions[0]
                                                  .UserPositiontype.position
                                              }
                                              size="sm"
                                              className="p-0 m-0 ps-2"
                                              tabindex="-1"
                                              as={BootstrapForm.Control}
                                            />
                                          </BootstrapForm.Group>

                                          <Col
                                            xs={12}
                                            lg={1}
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
                                                  <Col
                                                    xs="auto"
                                                    className="d-flex"
                                                  >
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
                                                    onClick={() =>
                                                      remove(index)
                                                    }
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
                                    )
                                  )}
                                {/* {id ? (
                              <Row className="mt-2">
                                <Col xs="auto">
                                  {' '}
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={(e) => {
                                      if (
                                        values.WorkerTaskServant.find(
                                          ({ end }) => end == null
                                        )
                                      ) {
                                        toast.error(
                                          'Para vincular um novo contrato ao colaborador, o contrato ativo precisa ser encerrado!'
                                        );
                                      } else {
                                        push(e);
                                      }
                                    }}
                                  >
                                    <FaPlus /> Novo contrato
                                  </Button>
                                </Col>
                              </Row>
                            ) : null} */}
                              </Col>
                            </Row>
                          </>
                        );
                      }}
                    </FieldArray>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">PROFISSIONAIS ESCALADOS</span>
                    </Col>

                    <FieldArray name="WorkerTaskItem" className="p-0">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <>
                            <Row className="d-flex justify-content-center align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                              <Col xs="12" md="auto" className="ps-0 pe-2">
                                PESQUISA DE PROFISSIONAL:
                              </Col>
                              <Col className="p-0">
                                {' '}
                                <Select
                                  inputId="searchWorker"
                                  options={workers
                                    .filter(
                                      (item) =>
                                        !values.WorkerTaskItem.find(
                                          (element) => element.id === item.id
                                        )
                                    )
                                    .map((item) => ({
                                      label: item.name,
                                      value: item,
                                    }))}
                                  // options={inventoryData.map((material) => ({
                                  //   value: material,
                                  //   label: `(${material.materialId}) ${material.name} - ${material.unit}`,
                                  // }))}
                                  value={null}
                                  // onChange={(selected, action) => {
                                  //   handlePushItem(
                                  //     push,
                                  //     selected,
                                  //     values.MaterialReserveItems
                                  //   );
                                  //   setFieldValue('searchMaterial', '');
                                  // }}
                                  placeholder="Selecione o profissional"
                                  // onBlur={() =>
                                  //   setFieldValue('searchMaterial', '')
                                  // }
                                  escapeClearsValue
                                  onChange={(e) => {
                                    console.log(e.value);
                                    push(e.value);
                                  }}
                                  // filterOption={filterOptions}
                                />
                              </Col>
                            </Row>
                            <Row className="d-flex justify-content-center align-items-center">
                              <Col xs={12}>
                                {values.WorkerTaskItem?.length > 0 &&
                                  values.WorkerTaskItem?.map((item, index) => (
                                    <>
                                      <Row className="d-block d-lg-none">
                                        <Col className="fw-bold">
                                          Colaborador nº {index + 1}
                                        </Col>
                                      </Row>
                                      <Row
                                        key={item.id}
                                        className="d-flex p-0 m-0 border-bottom"
                                      >
                                        <BootstrapForm.Group
                                          as={Col}
                                          xs={12}
                                          lg={1}
                                          controlId={`WorkerTaskItem[${index}].id`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                              ID
                                            </BootstrapForm.Label>
                                          ) : null}
                                          <Field
                                            type="text"
                                            plaintext
                                            readOnly
                                            value={item.id}
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                            as={BootstrapForm.Control}
                                          />
                                        </BootstrapForm.Group>

                                        <BootstrapForm.Group
                                          as={Col}
                                          xs={12}
                                          lg={6}
                                          controlId={`WorkerTaskItem[${index}].name`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                              Nome
                                            </BootstrapForm.Label>
                                          ) : null}
                                          <Field
                                            type="text"
                                            plaintext
                                            readOnly
                                            value={item.name}
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                            as={BootstrapForm.Control}
                                          />
                                        </BootstrapForm.Group>

                                        <BootstrapForm.Group
                                          as={Col}
                                          xs={12}
                                          lg={4}
                                          controlId={`WorkerTaskItem[${index}].name`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                              Função
                                            </BootstrapForm.Label>
                                          ) : null}
                                          <Field
                                            type="text"
                                            plaintext
                                            readOnly
                                            value={item.job}
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                            as={BootstrapForm.Control}
                                          />
                                        </BootstrapForm.Group>

                                        <Col
                                          xs={12}
                                          lg={1}
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
                                                <Col
                                                  xs="auto"
                                                  className="d-flex"
                                                >
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
                                {/* {id ? (
                              <Row className="mt-2">
                                <Col xs="auto">
                                  {' '}
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={(e) => {
                                      if (
                                        values.WorkerTaskItem.find(
                                          ({ end }) => end == null
                                        )
                                      ) {
                                        toast.error(
                                          'Para vincular um novo contrato ao colaborador, o contrato ativo precisa ser encerrado!'
                                        );
                                      } else {
                                        push(e);
                                      }
                                    }}
                                  >
                                    <FaPlus /> Novo contrato
                                  </Button>
                                </Col>
                              </Row>
                            ) : null} */}
                              </Col>
                            </Row>
                          </>
                        );
                      }}
                    </FieldArray>
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
