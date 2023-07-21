/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  Form,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { IMaskInput } from 'react-imask';
import { FaPhone, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import * as yup from 'yup'; // RulesValidation
import { Formik, FieldArray } from 'formik'; // FormValidation
import Select from 'react-select';
import { update } from 'lodash';
import { computeReshapedDimensions } from 'face-api.js/build/commonjs/utils';
import axios from '../../../../services/axios';
import { primaryDarkColor } from '../../../../config/colors';
import Loading from '../../../../components/Loading';

import validateCPF from '../../../../assets/script/validateCPF';

import ProfilePhoto from './components/ProfilePhoto';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

export default function Index({ data, handleCancelModal, handleSaveModal }) {
  const [isLoading, setIsLoading] = useState(false);
  // const [contacttypes, setContacttypes] = useState([]);
  const [jobtypes, setJobtypes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [contractsDangers, setContractsDangers] = useState([]);
  const [contractsRegimes, setContractsRegimes] = useState([]);
  const [contractsUnhealthies, setContractsUnhealthies] = useState([]);
  const [photoURL, setPhotoURL] = useState(
    `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/default.png`
  );
  const [photo, setPhoto] = React.useState('');
  const template = {
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    rg: '',
    cpf: '',
    filenamePhoto: '',
    WorkerContracts: [
      {
        ContractId: '',
        WorkerJobtypeId: '',
        WorkerContractRegimeId: '',
        WorkerContractDangerId: '',
        WorkerContractUnhealthyId: '',
        acting: '',
        unidadeId: '',
        start: '',
        end: '',
        obs: '',
      },
    ],
  };
  const [initialValues, setInitialValues] = useState(template);

  const id = data?.id;

  const updateValues = useRef({});

  console.log(validateCPF('07806858491'));

  const schema = yup.object().shape({
    name: yup.string().required('Requerido'),
    // email: yup.string().email('Digite um email válido').required('Requerido'),
    // rg: yup.string().required('Requerido'),
    // phone: yup.string().required('Requerido'),
    // cpf: yup
    //   .string()
    //   .test('is-valid', 'CPF inválido', (cpf) => validateCPF(cpf)),
    // birthdate: yup
    //   .date()
    //   .max(new Date(), 'Não é possível incluir uma data futura')
    //   .required('Campo obrigatório'),
    WorkerContracts: yup
      .array()
      .of(
        yup.object().shape({
          ContractId: yup.number().required('Contrato requerido').positive(),
          WorkerJobtypeId: yup.number().required('Função requerida').positive(),
          unidadeId: yup.number().required('Lotação requerida'),
          start: yup
            .date()
            .required('Início requerido')
            // .min(
            //   // the month is 0-indexed
            //   new Date(2022, 9, 14).toISOString().split('T')[0],
            //   'Escolha uma data superior a data de início do sistema'
            // )
            .max(
              new Date().toISOString().split('T')[0],
              'Escolha uma data passada para o início do contrato'
            ),
        })
      )
      .required()
      .min(1, 'A lista de materiais não pode ser vazia'),
  });

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

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        if (id) {
          const responseWorker = await axios.get(`/workers/${id}`);
          setInitialValues(responseWorker.data);
          if (responseWorker.data.filenamePhoto)
            setPhotoURL(
              `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/${responseWorker.data.filenamePhoto}`
            );
        }
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

    async function getOthersData() {
      try {
        setIsLoading(true);

        const responseContract = await axios.get(`/workers/contracts`);
        const responseJob = await axios.get(`/workers/jobtypes`);
        const responseDangers = await axios.get(`/workers/contract/dangers`);
        const responseRegimes = await axios.get(`/workers/contract/regimes`);
        const responseUnhealthies = await axios.get(
          `/workers/contract/unhealthies`
        );

        setContracts(responseContract.data);
        setJobtypes(responseJob.data);
        setContractsDangers(responseDangers.data);
        setContractsRegimes(responseRegimes.data);
        setContractsUnhealthies(responseUnhealthies.data);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    getOthersData();
  }, []);

  const checkUpdate = (key, value) => {
    const arr = key.split('.');

    if (arr.length === 1) {
      if (initialValues[key] !== value) {
        updateValues.current[key] = value;
      }
    } else {
      const arrObj = arr[0].match(/[a-zA-Z0-9]+/)[0];
      // se não existir, crie o array para ser preenchido
      if (!updateValues.current[arrObj]) updateValues.current[arrObj] = [{}];
      // eslint-disable-next-line no-useless-escape
      const index = arr[0].match(/[\[\d\]]+/)[0].match(/[0-9]+/)[0];
      const newKey = arr[1];
      while (updateValues.current[arrObj].length - 1 < index) {
        updateValues.current[arrObj].push({});
      }
      updateValues.current[arrObj][index][newKey] = value;
    }
  };

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

  const handleStore = async (values, resetForm) => {
    const formattedValues = {
      ...cleanEmpty(values),
    };

    Object.entries(formattedValues).forEach((item) => {
      if (
        Array.isArray(item[1]) &&
        typeof item[1] === 'object' &&
        Object.keys(item[1]).length === 1 &&
        Object.keys(item[1][0]).length === 0
      ) {
        delete formattedValues[item[0]];
      }
    }); // LIMPANDO ARRAYS NULOS (tabelas vinculadas para nao dar erro)

    const formData = toFormData(formattedValues);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      setIsLoading(true);
      if (photo) {
        await axios.post(`/workers/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(`/workers/`, formattedValues);
      }

      resetForm();
      setPhoto('');
      setPhotoURL(
        `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/default.png`
      );
      setIsLoading(false);
      toast.success('Colaborador Cadastrado Com Sucesso!');
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    const formattedValues = {
      ...values,
    };

    formattedValues.id = id;

    const formData = toFormData(formattedValues);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO E RETORNA PARA A LISTAGEM
      if (photo) {
        await axios.put(`/workers/${formattedValues.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.put(`/workers/${formattedValues.id}`, formattedValues);
      }

      setIsLoading(false);
      toast.success(`Edição de registro realizada com sucesso`);
    } catch (err) {
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
            <span className="fs-5">INFORMAÇÕES PESSOAIS</span>
          </Col>
        </Row>
        <Row className="pt-2">
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              if (id) {
                handleUpdate(updateValues.current);
                handleSaveModal();
              } else {
                handleStore(values, resetForm);
              }
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
                  <Col
                    xs="12"
                    md="auto"
                    className="px-3 d-flex justify-content-center align-items-center"
                  >
                    <ProfilePhoto
                      setPhoto={setPhoto}
                      photoURL={photoURL}
                      setPhotoURL={setPhotoURL}
                    />
                  </Col>
                  <Col md={8} lg={6}>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        controlId="name"
                        className="pb-3"
                      >
                        <Form.Label>NOME</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.name}
                          onChange={(e) => {
                            handleChange(e);
                            checkUpdate(
                              e.target.id,
                              e.target.value.toUpperCase()
                            );
                          }}
                          isInvalid={touched.name && !!errors.name}
                          isValid={touched.name && !errors.name}
                          placeholder="Digite o nome completo"
                          onBlur={(e) => {
                            setFieldValue('name', e.target.value.toUpperCase()); // UPPERCASE
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
                          {errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={4}
                        controlId="cpf"
                        className="pb-3"
                      >
                        <Form.Label>CPF</Form.Label>
                        <Form.Control
                          type="tel"
                          as={IMaskInput}
                          mask="000.000.000-00"
                          value={values.cpf}
                          isInvalid={touched.cpf && !!errors.cpf}
                          // isValid={touched.cpf && !errors.cpf}
                          placeholder="Digite o CPF"
                          onBlur={handleBlur}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                            checkUpdate(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.cpf}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={4}
                        controlId="rg"
                        className="pb-3"
                      >
                        <Form.Label>RG</Form.Label>
                        <Form.Control
                          type="tel"
                          as={IMaskInput}
                          mask={Number}
                          value={values.rg}
                          isInvalid={touched.rg && !!errors.rg}
                          // isValid={touched.rg && !errors.rg}
                          placeholder="Digite o RG"
                          onBlur={handleBlur}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                            checkUpdate(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.rg}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={4}
                        controlId="birthdate"
                        className="pb-3"
                      >
                        <Form.Label>NASCIMENTO</Form.Label>
                        <Form.Control
                          type="date"
                          value={values.birthdate}
                          onChange={(e) => {
                            handleChange(e);
                            checkUpdate(
                              e.target.id,
                              e.target.value.toUpperCase()
                            );
                          }}
                          isInvalid={touched.birthdate && !!errors.birthdate}
                          // isValid={touched.birthdate && !errors.birthdate}
                          placeholder="Selecione a data"
                          onBlur={handleBlur}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.birthdate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={8}
                        controlId="email"
                        className="pb-3"
                      >
                        <Form.Label>EMAIL</Form.Label>
                        <Form.Control
                          as={IMaskInput}
                          mask={/^\S*@?\S*$/}
                          type="text"
                          value={values.email}
                          // onChange={handleChange}
                          isInvalid={touched.email && !!errors.email}
                          // isValid={touched.email && !errors.email}
                          placeholder="Digite o email"
                          onBlur={(e) => {
                            setFieldValue(
                              'email',
                              e.target.value.toLowerCase()
                            ); // lowercase
                            handleBlur(e);
                          }}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                            checkUpdate(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group
                        as={Col}
                        xs={12}
                        lg={4}
                        controlId="phone"
                        className="pb-3"
                      >
                        <Form.Label>TELEFONE</Form.Label>
                        <Form.Control
                          as={IMaskInput}
                          mask="(00) 0.0000-0000"
                          type="tel"
                          value={values.phone}
                          // onChange={handleChange}
                          isInvalid={touched.phone && !!errors.phone}
                          // isValid={touched.phone && !errors.phone}
                          placeholder="Digite o telefone"
                          onBlur={(e) => {
                            setFieldValue(
                              'phone',
                              e.target.value.toLowerCase()
                            ); // lowercase
                            handleBlur(e);
                          }}
                          onAccept={(value, mask) => {
                            setFieldValue(mask.el.input.id, mask.unmaskedValue);
                            checkUpdate(mask.el.input.id, mask.unmaskedValue);
                          }}
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
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

                  <FieldArray name="WorkerContracts">
                    {(fieldArrayProps) => {
                      const { remove, push } = fieldArrayProps;
                      return (
                        <Row className="d-flex justify-content-center align-items-center">
                          <Col md={12} lg={10}>
                            {values.WorkerContracts?.length > 0 &&
                              values.WorkerContracts?.map((item, index) => (
                                <div
                                  key={index}
                                  className="my-3 p-4 border"
                                  // style={{ background: '#E9EFFA' }}
                                >
                                  <Row>
                                    <Col className="fs-5 text-center">
                                      <Badge bg="info" text="white">
                                        Nº {index + 1}
                                      </Badge>
                                    </Col>
                                  </Row>

                                  <div key={index}>
                                    <Row className="d-flex justify-content-center align-items-center mt-2">
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        className="pb-3"
                                        controlId={`WorkerContracts[${index}].ContractId`}
                                      >
                                        <Form.Label>CONTRATO</Form.Label>
                                        {/* {console.log(
                                          touched.WorkerContracts[index]
                                            ?.ContractId,
                                          errors.WorkerContracts
                                        )} */}
                                        <Form.Select
                                          type="text"
                                          value={item.ContractId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione o Contrato"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end ||
                                            initialValues.WorkerContracts[index]
                                              ?.ContractId
                                          }
                                        >
                                          <option>Selecione o Contrato</option>
                                          {contracts.map((contract) => (
                                            <option
                                              key={contract.id}
                                              value={contract.id}
                                            >
                                              {contract.codigoSipac} |{' '}
                                              {contract.objeto.slice(
                                                0,
                                                contract.objeto.length < 60
                                                  ? contract.objeto.length
                                                  : 60
                                              )}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        controlId={`WorkerContracts[${index}].WorkerJobtypeId`}
                                        className="pb-3"
                                      >
                                        <Form.Label>FUNÇÃO</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.WorkerJobtypeId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione a Função"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.WorkerJobtypeId
                                          }
                                        >
                                          <option>Selecione a Função</option>
                                          {jobtypes.map((job) => (
                                            <option key={job.id} value={job.id}>
                                              {job.job}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        controlId={`WorkerContracts[${index}].acting`}
                                        className="pb-3"
                                      >
                                        <Form.Label>ATUAÇÃO</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.acting}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione a atuação"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.acting
                                          }
                                        >
                                          <option>Selecione a atuação</option>

                                          <option value="ALTA TENSÃO">
                                            ALTA TENSÃO
                                          </option>
                                          <option value="LÓGICA DE DADOS">
                                            LÓGICA DE DADOS
                                          </option>
                                          <option value="CENÁRIOS">
                                            CENÁRIOS
                                          </option>
                                        </Form.Select>
                                      </Form.Group>
                                    </Row>
                                    <Row className="d-flex justify-content-center align-items-center">
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        controlId={`WorkerContracts[${index}].WorkerContractRegimeId`}
                                        className="pb-3"
                                      >
                                        <Form.Label>REGIME</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.WorkerContractRegimeId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione o regime"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        >
                                          <option>Selecione o regime</option>
                                          {contractsRegimes.map((regime) => (
                                            <option
                                              key={regime.id}
                                              value={regime.id}
                                            >
                                              {regime.regime}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        controlId={`WorkerContracts[${index}].WorkerContractDangerId`}
                                        className="pb-3"
                                      >
                                        <Form.Label>PERICULOSIDADE</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.WorkerContractDangerId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione a periculosidade"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        >
                                          <option>
                                            Selecione a periculosidade
                                          </option>
                                          {contractsDangers.map((danger) => (
                                            <option
                                              key={danger.id}
                                              value={danger.id}
                                            >
                                              {danger.danger}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={4}
                                        controlId={`WorkerContracts[${index}].WorkerContractUnhealthyId`}
                                        className="pb-3"
                                      >
                                        <Form.Label>INSALUBRIDADE</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.WorkerContractUnhealthyId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione a insalubridade"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        >
                                          <option>
                                            Selecione a insalubridade
                                          </option>
                                          {contractsUnhealthies.map(
                                            (unhealthy) => (
                                              <option
                                                key={unhealthy.id}
                                                value={unhealthy.id}
                                              >
                                                {unhealthy.unhealthy}
                                              </option>
                                            )
                                          )}
                                        </Form.Select>
                                      </Form.Group>
                                    </Row>
                                    <Row className="d-flex justify-content-center align-items-center">
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={6}
                                        controlId={`WorkerContracts[${index}].unidadeId`}
                                        className="pb-3"
                                      >
                                        <Form.Label>LOTAÇÃO</Form.Label>
                                        <Form.Select
                                          type="text"
                                          value={item.unidadeId}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Selecione a unidade de lotação"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        >
                                          <option>
                                            Selecione a unidade de lotação
                                          </option>
                                          {contracts
                                            .find(
                                              (contract) =>
                                                String(contract.id) ===
                                                String(
                                                  values.WorkerContracts[index]
                                                    .ContractId
                                                )
                                            )
                                            ?.ContractUnidades?.map((i) => (
                                              <option
                                                key={i.UnidadeSipacId}
                                                value={i.UnidadeSipacId}
                                              >
                                                {i.UnidadeSipacId} |{' '}
                                                {i.Unidade.nomeUnidade.slice(
                                                  0,
                                                  i.Unidade.nomeUnidade.length <
                                                    60
                                                    ? i.Unidade.nomeUnidade
                                                        .length
                                                    : 60
                                                )}
                                              </option>
                                            ))}
                                        </Form.Select>
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={3}
                                        controlId={`WorkerContracts[${index}].start`}
                                        className="pb-3"
                                      >
                                        <Form.Label>INÍCIO</Form.Label>
                                        <Form.Control
                                          type="date"
                                          value={item.start}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Digite o inicio do contrato"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        />
                                      </Form.Group>
                                      <Form.Group
                                        as={Col}
                                        xs={12}
                                        md={12}
                                        lg={3}
                                        controlId={`WorkerContracts[${index}].end`}
                                        className="pb-3"
                                      >
                                        <Form.Label>FIM</Form.Label>{' '}
                                        <OverlayTrigger
                                          placement="top"
                                          delay={{ show: 250, hide: 400 }}
                                          overlay={(props) =>
                                            renderTooltip(
                                              props,
                                              'Utilizar para desligamento do funcionário e mudança de função ou contrato'
                                            )
                                          }
                                        >
                                          <Button
                                            className="px-1 py-0"
                                            size="sm"
                                            variant="outline-dark"
                                            style={{ height: '20px' }}
                                          >
                                            ?
                                          </Button>
                                        </OverlayTrigger>
                                        <Form.Control
                                          type="date"
                                          value={item.end}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Digite o fim do contrato"
                                          onBlur={handleBlur}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        />
                                      </Form.Group>
                                    </Row>

                                    <Row>
                                      <Form.Group
                                        xs={12}
                                        className="pb-3"
                                        controlId={`WorkerContracts[${index}].obs`}
                                      >
                                        <Form.Label>OBSERVAÇÕES:</Form.Label>
                                        <Form.Control
                                          as="textarea"
                                          rows={2}
                                          type="text"
                                          value={item.obs}
                                          onChange={(e) => {
                                            handleChange(e);
                                            checkUpdate(
                                              e.target.id,
                                              e.target.value.toUpperCase()
                                            );
                                          }}
                                          placeholder="Observações do contrato"
                                          onBlur={(e) => {
                                            setFieldValue(
                                              `WorkerContracts[${index}].obs`,
                                              e.target.value.toUpperCase()
                                            ); // UPPERCASE
                                            handleBlur(e);
                                          }}
                                          disabled={
                                            initialValues.WorkerContracts[index]
                                              ?.end
                                          }
                                        />
                                      </Form.Group>
                                    </Row>
                                    <Row className="d-flex justify-content-end pb-3">
                                      {initialValues.WorkerContracts[
                                        index
                                      ] ? null : (
                                        <Col xs="auto">
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => remove(index)}
                                          >
                                            <FaTrashAlt />
                                          </Button>
                                        </Col>
                                      )}
                                    </Row>
                                  </div>
                                  {touched.WorkerContracts &&
                                  errors.WorkerContracts
                                    ? errors.WorkerContracts[index]
                                      ? Object.values(
                                          errors.WorkerContracts[index]
                                        ).map((value) => (
                                          <Badge bg="danger" className="me-2">
                                            {value}
                                          </Badge>
                                        ))
                                      : null
                                    : null}
                                </div>
                              ))}
                            {id ? (
                              <Row className="mt-2">
                                <Col xs="auto">
                                  {' '}
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={(e) => {
                                      if (
                                        values.WorkerContracts.find(
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
                            ) : null}
                          </Col>
                        </Row>
                      );
                    }}
                  </FieldArray>
                </Row>

                <Row className="justify-content-center pt-2 pb-4">
                  {id ? (
                    <>
                      <Col xs="auto" className="text-center">
                        <Button
                          variant="danger"
                          onClick={() => {
                            updateValues.current = {};
                            resetForm();
                            handleCancelModal();
                          }}
                        >
                          Cancelar
                        </Button>
                      </Col>
                      <Col xs="auto" className="text-center">
                        <Button variant="success" type="submit">
                          Alterar
                        </Button>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col xs="auto" className="text-center">
                        <Button
                          variant="warning"
                          onClick={() => {
                            resetForm();
                            setPhoto('');
                            setPhotoURL(
                              `${process.env.REACT_APP_BASE_AXIOS_REST}/workers/images/default.png`
                            );
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
                  )}
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
      </div>
    </>
  );
}
