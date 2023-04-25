/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  Form as BootstrapForm,
} from 'react-bootstrap';
import Select from 'react-select';
import { FaPhone, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import axios from '../../../../../services/axios';
import Loading from '../../../../../components/Loading';
import { primaryDarkColor } from '../../../../../config/colors';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

const emptyValues = {
  reqMaintenance: '',
  title: '',
  description: '',
  start: '',
  end: '',
  place: '',
  propertySipacId: '',
  buildingSipacId: '',
  buildingSipacSubRip: '',
  extraActivity: false,
  WorkerTasktypeId: '',
  WorkerTaskItems: [],
  WorkerTaskServants: [],
  WorkerTaskRisks: [],
  WorkerTaskStatuses: [],
};

const validationSchema = Yup.object().shape({
  reqMaintenance: Yup.string().matches(
    /^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/,
    'Entrada inválida'
  ),
  WorkerTasktypeId: Yup.number().required('Tipo de demanda obrigatória'),
  propertySipacId: Yup.object().required('Imóvel obritatório'),
  buildingSipacId: Yup.number().required('Instalação Física obrigatória'),
  title: Yup.string().required('Título obrigatório'),
  // description: Yup.string().required('Descrição is required'),
  start: Yup.date()
    .required('Início requerido')
    // .min(
    //   // the month is 0-indexed
    //   new Date(2022, 9, 14).toISOString().split('T')[0],
    //   'Escolha uma data superior a data de início do sistema'
    // )
    .min(
      new Date().toISOString().split('T')[0],
      'Escolha uma data futura para o início do agendamento'
    ),
  end: Yup.date()
    .required('Fim requerido')
    // .min(
    //   // the month is 0-indexed
    //   new Date(2022, 9, 14).toISOString().split('T')[0],
    //   'Escolha uma data superior a data de início do sistema'
    // )
    .min(
      new Date().toISOString().split('T')[0],
      'Escolha uma data futura para o fim do agendamento'
    ),
});

const formatReq = (req) => {
  if (!req) return;
  const currentYear = new Date().getFullYear();
  return req.includes('/') ? req : `${req}/${currentYear}`;
};

const cleanEmpty = (obj) => {
  if (Array.isArray(obj)) {
    return (
      obj
        .map((v) => (v && typeof v === 'object' ? cleanEmpty(v) : v))
        // eslint-disable-next-line eqeqeq
        .filter((v) => !(v == null || v == ''))
    );
  }
  return (
    Object.entries(obj)
      .map(([k, v]) => [k, v && typeof v === 'object' ? cleanEmpty(v) : v])
      // eslint-disable-next-line no-return-assign, eqeqeq, no-param-reassign
      .reduce((a, [k, v]) => (v == null || v == '' ? a : ((a[k] = v), a)), {})
  );
};
// LIMPANDO CHAVES NULL, UNDEFINED, EMPTY STRINGS

const convertEmptyToNull = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((value) => convertEmptyToNull(value));
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
          return [key, value];
        }
        return [key, convertEmptyToNull(value) ?? null];
      })
    );
  }

  return obj ?? null;
};

export default function RiskTaskForm({ initialValues = null }) {
  const userId = useSelector((state) => state.auth.user.id);
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [servants, setServants] = useState([]);
  const [risksTypes, setRisksTypes] = useState([]);
  const [tasksTypes, setTasksTypes] = useState([]);
  const [risksVisibility, setRisksVisibility] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertiesData, setPropertiesData] = useState([]);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      // const workersOp = [];
      try {
        setIsLoading(true);
        const response2 = await axios.get('/users');
        const response3 = await axios.get('/workerstasks/risks/types');
        const response4 = await axios.get('/workerstasks/types');

        setServants(response2.data);
        setRisksTypes(response3.data);
        setTasksTypes(response4.data);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    async function getWorkersData() {
      const workersOp = [];
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/');
        const workersJobs = response.data
          .filter(
            (value, index, arr) =>
              arr.findIndex((item) => item.job === value.job) === index
          )
          .map((value) => value.job); // RETORNA OS DIFERENTES TRABALHOS

        workersJobs.forEach((value) => {
          workersOp.push([
            value,
            response.data.filter((item) => item.job === value),
          ]);
        });

        setWorkers(workersOp);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    async function getPropertiesData() {
      const propertiesOp = [];
      try {
        setIsLoading(true);
        const response = await axios.get('/properties/');
        const propertiesCities = response.data
          .filter(
            (value, index, arr) =>
              arr.findIndex((item) => item.municipio === value.municipio) ===
              index
          )
          .map((value) => value.municipio); // RETORNA OS DIFERENTES TRABALHOS

        propertiesCities.forEach((value) => {
          propertiesOp.push([
            value,
            response.data.filter((item) => item.municipio === value),
          ]);
        });

        // removendo o array de CAMPUS UNIVERSITARIO DE NATAL para nao ficar em duplicidade
        propertiesOp[0][1].shift();

        // colocando um grupo de CAMPUS CENTRAL pra facilitar a seleçào
        propertiesOp.unshift([
          'CAMPUS CENTRAL',
          [response.data[0], response.data[28]],
        ]);
        setProperties(propertiesOp);
        setPropertiesData(response.data);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    getData();
    getPropertiesData();
    getWorkersData();
  }, []);

  const handleSubmit = async (values, resetForm) => {
    const formattedValues = {
      ...convertEmptyToNull(values),
    };

    // tive que adicionar o valor na mão pq a função acima exclui do objeto chaves com valor falso, depois tem que averiguar
    // if (!formattedValues.extraActivity) formattedValues.extraActivity = false;

    formattedValues.propertySipacId = values.propertySipacId.id;

    formattedValues.WorkerTaskStatuses?.push({
      UserId: userId,
      WorkerTaskStatustypeId: 1,
    });

    try {
      setIsLoading(true);
      if (isEditMode) {
        // In edit mode, merge the new values with the existing ones
        const mergedValues = { ...initialValues, ...values };
        console.log(mergedValues);
      } else {
        console.log(formattedValues);
        // RESERVA, ATUALIZA O INVENTARIO E JA BLOQUEIA
        await axios.post(`/workerstasks`, formattedValues);

        setIsLoading(false);
        resetForm();

        toast.success(`Tarefa agendada com sucesso`);
      }
    } catch (err) {
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
                {isEditMode ? 'EDITAR' : 'CADASTRAR'} AGENDAMENTO DE SERVIÇO
                EXTRA, EXTERNO OU DE RISCO
              </span>
            </Col>
          </Row>
          <Row className="pt-2">
            <Formik
              initialValues={initialValues || emptyValues}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) =>
                handleSubmit(values, resetForm)
              }
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
                setFieldTouched,
              }) => (
                <Form as BootstrapForm onReset={handleReset}>
                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="reqMaintenance"
                      as={Col}
                      xs={12}
                      md={2}
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
                        type="tel"
                        name="reqMaintenance"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                        onBlur={(e) => {
                          setFieldValue(e.target.id, formatReq(e.target.value));
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="reqMaintenance"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      controlId="WorkerTasktypeId"
                      as={Col}
                      xs={12}
                      md={4}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>Tipo</BootstrapForm.Label>

                      <Field name="WorkerTasktypeId">
                        {({ field }) => (
                          <Select
                            inputId="WorkerTasktypeId"
                            placeholder="Selecione o tipo da demanda"
                            {...field}
                            className={
                              errors.WorkerTasktypeId &&
                              touched.WorkerTasktypeId
                                ? 'is-invalid'
                                : null
                            }
                            options={tasksTypes.map((option) => ({
                              label: option.type,
                              value: option.id,
                            }))}
                            value={
                              values.WorkerTasktypeId
                                ? tasksTypes.find(
                                    (option) =>
                                      option.value === values.WorkerTasktypeId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue(
                                'WorkerTasktypeId',
                                selectedOption.value
                              )
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="WorkerTasktypeId"
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
                        placeholder="Exemplo: Pintura de prédio da INFRA"
                        className={
                          errors.title && touched.title ? 'is-invalid' : null
                        }
                        type="text"
                        name="title"
                        as={BootstrapForm.Control}
                        onBlur={(e) => {
                          setFieldTouched(e.target.id, true);
                          setFieldValue(
                            e.target.id,
                            e.target.value.toUpperCase()
                          );
                          setFieldValue(
                            'start',
                            new Date().toISOString().split('T')[0]
                          );
                          setFieldValue(
                            'end',
                            new Date().toISOString().split('T')[0]
                          );
                        }}
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
                        onBlur={(e) => {
                          setFieldTouched(e.target.id, true);
                          setFieldValue(
                            e.target.id,
                            e.target.value.toUpperCase()
                          );
                        }}
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
                      className="pb-1"
                    >
                      <BootstrapForm.Label>Imóvel</BootstrapForm.Label>

                      <Field name="propertySipacId">
                        {({ field }) => (
                          <Select
                            {...field}
                            placeholder="Selecione o imóvel"
                            className={
                              errors.propertySipacId && touched.propertySipacId
                                ? 'is-invalid'
                                : null
                            }
                            options={properties.map((value) => ({
                              label: value[0],
                              options: value[1].map((item) => ({
                                value: item,
                                label: item.nomeImovel,
                              })),
                            }))}
                            value={
                              values.propertySipacId
                                ? properties.find(
                                    (option) =>
                                      option.value === values.propertySipacId
                                  )
                                : null
                            }
                            onChange={(selectedOption) => {
                              setFieldValue(
                                'propertySipacId',
                                selectedOption.value
                              );
                              setFieldValue('buildingSipacId', '');
                              setFieldTouched('buildingSipacId', false);
                            }}
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
                      className="pb-1"
                    >
                      <BootstrapForm.Label>
                        Instalação Física
                      </BootstrapForm.Label>

                      <Field name="buildingSipacId">
                        {({ field }) => (
                          <Select
                            {...field}
                            placeholder="Selecione as instalações físicas"
                            className={
                              errors.buildingSipacId && touched.buildingSipacId
                                ? 'is-invalid'
                                : null
                            }
                            options={propertiesData
                              .filter((property) =>
                                values.propertySipacId
                                  ? property.id === values.propertySipacId.id
                                  : false
                              )[0]
                              ?.buildingsSipac.map((building) => ({
                                value: building,
                                label: `${building.name} ${
                                  building.zone ? `(ZONA ${building.zone})` : ''
                                }`,
                              }))}
                            value={
                              values.buildingSipacId
                                ? propertiesData.find(
                                    (option) =>
                                      option.value === values.buildingSipacId
                                  )
                                : null
                            }
                            onChange={(selectedOption) => {
                              setFieldValue(
                                'buildingSipacId',
                                selectedOption.value.id
                              );
                              setFieldValue(
                                'buildingSipacSubRip',
                                selectedOption.value.subRip
                              );
                            }}
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

                  {values.propertySipacId ? (
                    <Row className="pb-3 mx-2">
                      <Col className="border">
                        Município:{' '}
                        <spam className="fw-bold">
                          {values.propertySipacId.municipio}
                        </spam>
                      </Col>
                      <Col className="border">
                        Tipo de imóvel:{' '}
                        <spam className="fw-bold">
                          {values.propertySipacId.tipoImovel}
                        </spam>
                      </Col>
                      <Col className="border">
                        RIP de imóvel:{' '}
                        <spam className="fw-bold">
                          {values.propertySipacId.rip}
                        </spam>
                      </Col>
                    </Row>
                  ) : null}

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
                        placeholder="Localização do serviço no imóvel. Exemplo: Auditório principal"
                        className={
                          errors.place && touched.place ? 'is-invalid' : null
                        }
                        type="text"
                        name="place"
                        as={BootstrapForm.Control}
                        onBlur={(e) => {
                          setFieldTouched(e.target.id, true);
                          setFieldValue(
                            e.target.id,
                            e.target.value.toUpperCase()
                          );
                        }}
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
                        onBlur={(e) => {
                          handleBlur(e);
                          if (!errors.start && !values.end)
                            setFieldValue('end', values.start);
                        }}
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

                  <Row>
                    <Col>
                      <Button
                        variant="outline-primary"
                        onClick={() => setRisksVisibility(!risksVisibility)}
                      >
                        Selecionar riscos {risksVisibility ? '-' : '+'}
                      </Button>
                    </Col>
                  </Row>

                  {risksVisibility ? (
                    <FieldArray name="WorkerTaskRisks" className="p-0">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <Row className="d-flex justify-content-between align-items-top border m-2 pt-2">
                            {risksTypes.map((risk) => (
                              <BootstrapForm.Group
                                key={risk.id}
                                controlId={`risk${risk.id}`}
                                as={Col}
                                xs={12}
                                sm={6}
                                md={4}
                                className="pb-3 d-flex justify-content-between"
                              >
                                <div className="d-flex">
                                  <BootstrapForm.Check
                                    // xs={6}
                                    type="checkbox"
                                    checked={
                                      values.WorkerTaskRisks.findIndex(
                                        (obj) =>
                                          obj.WorkerTaskRisktypeId === risk.id
                                      ) !== -1
                                    }
                                    name={`risk${risk.id}`}
                                    className="pe-2"
                                    onChange={(e) =>
                                      e.target.checked
                                        ? push({
                                            WorkerTaskRisktypeId: risk.id,
                                          })
                                        : remove(
                                            values.WorkerTaskRisks.findIndex(
                                              (obj) =>
                                                obj.WorkerTaskRisktypeId ===
                                                risk.id
                                            )
                                          )
                                    }
                                  />
                                  <OverlayTrigger
                                    placement="right"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={(props) =>
                                      renderTooltip(props, risk.desc)
                                    }
                                  >
                                    <BootstrapForm.Label>
                                      {risk.type}
                                    </BootstrapForm.Label>
                                  </OverlayTrigger>
                                </div>
                              </BootstrapForm.Group>
                            ))}
                          </Row>
                        );
                      }}
                    </FieldArray>
                  ) : null}

                  <Row className="d-flex justify-content-center align-items-center pt-3">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">SERVIDORES RELACIONADOS</span>
                    </Col>

                    <FieldArray name="WorkerTaskServants" className="p-0">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <>
                            <Row className="d-flex justify-content-center align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                              {/* <Col xs="12" md="auto" className="ps-0 pe-2">
                                PESQUISA DE SERVIDOR:
                              </Col> */}
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
                                        !values.WorkerTaskServants.find(
                                          (element) =>
                                            element.UserId === item.id
                                        )
                                    )
                                    .map((item) => ({
                                      label: item.name,
                                      value: item,
                                    }))}
                                  value={null}
                                  placeholder="Selecione o servidor"
                                  escapeClearsValue
                                  onChange={(e) => {
                                    console.log(e.value);
                                    push({
                                      UserId: e.value.id,
                                      name: e.value.name,
                                      position:
                                        e.value.UserPositions[0]
                                          .UserPositiontype.position,
                                    });
                                  }}
                                />
                              </Col>
                            </Row>
                            <Row className="d-flex justify-content-center align-items-center">
                              <Col xs={12}>
                                {values.WorkerTaskServants?.length > 0 &&
                                  values.WorkerTaskServants?.map(
                                    (item, index) => (
                                      <>
                                        <Row className="d-block d-lg-none">
                                          <Col className="fw-bold">
                                            Servidor nº {index + 1}
                                          </Col>
                                        </Row>
                                        <Row
                                          key={item.UserId}
                                          className="d-flex p-0 m-0 border-bottom"
                                        >
                                          <BootstrapForm.Group
                                            as={Col}
                                            xs={12}
                                            lg={1}
                                            controlId={`WorkerTaskServants[${index}].UserId`}
                                            className="border-0 m-0 p-0 d-none"
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
                                              value={item.UserId}
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
                                            controlId={`WorkerTaskServants[${index}].name`}
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
                                            controlId={`WorkerTaskServants[${index}].position`}
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
                                              value={item.position}
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
                              </Col>
                            </Row>
                          </>
                        );
                      }}
                    </FieldArray>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-center pt-3">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">PROFISSIONAIS ESCALADOS</span>
                    </Col>

                    <FieldArray name="WorkerTaskItems" className="p-0">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <>
                            <Row className="d-flex justify-content-center align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                              {/* <Col xs="12" md="auto" className="ps-0 pe-2">
                                PESQUISA DE PROFISSIONAL:
                              </Col> */}
                              <Col className="p-0">
                                {' '}
                                <Select
                                  inputId="searchWorker"
                                  options={workers.map((value) => ({
                                    label: value[0],
                                    options: value[1].map((item) => ({
                                      value: item,
                                      label: item.name,
                                    })),
                                  }))}
                                  value={null}
                                  placeholder="Selecione o profissional"
                                  escapeClearsValue
                                  onChange={(e) => {
                                    push({
                                      WorkerId: e.value.id,
                                      name: e.value.name,
                                      job: e.value.job,
                                    });
                                  }}
                                />
                              </Col>
                            </Row>
                            <Row className="d-flex justify-content-center align-items-center">
                              <Col xs={12}>
                                {values.WorkerTaskItems?.length > 0 &&
                                  values.WorkerTaskItems?.map((item, index) => (
                                    <>
                                      <Row className="d-block d-lg-none">
                                        <Col className="fw-bold">
                                          Colaborador nº {index + 1}
                                        </Col>
                                      </Row>
                                      <Row
                                        key={item.WorkerId}
                                        className="d-flex p-0 m-0 border-bottom"
                                      >
                                        <BootstrapForm.Group
                                          as={Col}
                                          xs={12}
                                          lg={1}
                                          controlId={`WorkerTaskItems[${index}].WorkerId`}
                                          className="border-0 m-0 p-0 d-none"
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
                                            value={item.WorkerId}
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
                                          controlId={`WorkerTaskItems[${index}].name`}
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
                                          controlId={`WorkerTaskItems[${index}].name`}
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
                              </Col>
                            </Row>
                          </>
                        );
                      }}
                    </FieldArray>
                  </Row>

                  <Row className="justify-content-center pt-2 pb-4">
                    <Col xs="auto" className="text-center">
                      <Button variant="danger" type="reset">
                        Limpar
                      </Button>
                    </Col>
                    <Col xs="auto" className="text-center">
                      <Button variant="success" type="submit">
                        {isEditMode ? 'Alterar' : 'Cadastrar'}
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
