/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import { get } from 'lodash';
import { useSelector } from 'react-redux';
import {
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaSignInAlt,
  FaLock,
  FaArrowAltCircleDown,
} from 'react-icons/fa';
import {
  Button,
  Row,
  Col,
  Form,
  Badge,
  Collapse,
  InputGroup,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';

import * as yup from 'yup'; // RulesValidation
import { Formik, FieldArray } from 'formik'; // FormValidation
import Select from 'react-select';
import axios from 'axios';
import axiosRest from '../../../../services/axios';
import {
  primaryDarkColor,
  body1Color,
  body2Color,
} from '../../../../config/colors';
import Loading from '../../../../components/Loading';

import SearchModalInventory from '../../out/components/SearchModalInventory';
import ReleaseItemsModal from './components/ReleaseItemsModal';
import ModalLoginSipac from './components/ModalLoginSipac';

const formatGroupLabel = (data) => (
  <Col className="d-flex justify-content-between">
    <span>{data.label}</span>
    <Badge bg="secondary">{data.options.length}</Badge>
  </Col>
);

const filterOptions = (row, filterValue) => {
  const arrayFilter = String(filterValue).split(' ');

  return arrayFilter.reduce((res, cur) => {
    // res -> response; cur -> currency (atual)
    res =
      res &&
      String(row.label).toLowerCase().includes(String(cur).toLowerCase());
    return res;
  }, true);
};

export default function Index() {
  const userId = useSelector((state) => state.auth.user.id);
  const userName = useSelector((state) => state.auth.user.name);
  const [inventoryData, setinventoryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [reqRMs, setReqRMs] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showModalSearch, setShowModalSearch] = useState(false);
  const [showModalLoginSipac, setShowModalLoginSipac] = useState(false);
  const [RMModal, setRMModal] = useState('');
  const [importSipac, setImportSipac] = useState(false);
  const [userSipac, setUserSipac] = useState({});
  // Rel = release
  const [showModalRel, setShowModalRel] = useState(false);
  const [reqInModal, setReqInModal] = useState('');
  const [openCollapse, setOpenCollapse] = useState(false);
  const inputRef = useRef();

  const handleCancelModal = () => {
    setShowModalRel(false);
    setShowModalSearch(false);
    setShowModalLoginSipac(false);
  };

  const handleCloseModalRel = () => {
    setShowModalRel(false);
  };

  const handleCloseModalSearch = () => setShowModalSearch(false);

  const handleCloseModalLoginSipac = () => setShowModalLoginSipac(false);

  const handleShowModalRel = (reqIn) => {
    setReqInModal(reqIn);
    setShowModalRel(true);
  };

  const handleShowModalLoginSipac = (RM) => {
    setRMModal(RM);
    setShowModalLoginSipac(true);
  };

  const handleSaveModalLoginSipac = (setFieldValue, credentials) => {
    // eslint-disable-next-line no-use-before-define
    importRMSipac(RMModal, setFieldValue, credentials);
    setShowModalLoginSipac(false);
  };

  const handleShowModalSearch = () => setShowModalSearch(true);

  const handlePushItem = (push, row, list) => {
    // não incluir repetido na lista
    // console.log(row);
    // console.log(list);
    if (list.length > 0) {
      let exists = false;

      list.every((item) => {
        if (item.materialId === row.value.materialId) {
          exists = true;
          return false;
        }
        return true;
      });

      if (exists) {
        toast.error('Item já incluído na lista de reserva');
        return;
      }
    }

    // adicionar na lista de saída
    push({
      materialId: row.value.materialId,
      name: row.value.name,
      unit: row.value.unit,
      balancedQuantity: row.value.freeInventory,
      value: row.value.value
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9\.]+/g, ''),
      quantity: row.value.quantity ?? '',
    });
  };

  const schema = yup.object().shape({
    reqMaintenance: yup
      .string()
      .matches(/^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/, 'Entrada inválida')
      .required('Requerido'),
    RMSipac: yup
      .string()
      .matches(/^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/, 'Entrada inválida'),
    intendedUse: yup
      .date()
      .min(
        new Date().toISOString().split('T')[0],
        'Escolha uma data futura para reserva'
      )
      .required('Requerido'),
    workerId: yup.object().required('Requerido'),
    authorizedBy: yup.object().required('Requerido'),
    obs: yup.string(),
    // eslint-disable-next-line react/forbid-prop-types
    MaterialReserveItems: yup
      .array()
      .of(
        yup.object().shape({
          quantity: yup.number().required('Requerido').positive(),
        })
      )
      .required()
      .min(1, 'A lista de materiais não pode ser vazia'),
  });

  async function getMaterialsData() {
    try {
      setIsLoading(true);
      const response = await axiosRest.get('/materials/inventory/');
      setinventoryData(response.data);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  }

  const showErrorsSipac = (errorsArray) => {
    errorsArray.forEach((error) =>
      toast.error(error, {
        autoClose: false,
        draggable: true,
        closeOnClick: true,
      })
    );
  };

  function getCredentials(values) {
    setUserSipac(values);
  }

  async function importRMSipac(requisicoes, setFieldValue, credentials) {
    try {
      setIsLoading(true);

      const exists = await axiosRest.post('/materials/in/reqMaterial', {
        req: requisicoes,
      });

      if (exists.data)
        throw new Error(
          'Requisição já recebida pelo depósito provisório, realize a saída pela OS e vincule à RM desejada'
        );

      const payload = { requisicoes: [requisicoes], user: credentials };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_AXIOS_SIPAC}/reqmaterial/reserve/`,
        payload
      );

      if (response.data.errors.length > 0) {
        showErrorsSipac(response.data.errors);
        setIsLoading(false);
        return;
      }

      const reqSipac = response.data.info[0];

      setFieldValue(
        'reqMaintenance',
        reqSipac.dadosJSON['Número da Requisição Relacionada'].match(
          /^\d+\/\d{4}/
        )[0]
      );

      const materials = reqSipac.itensJSON.map((item) => ({
        materialId: item['Código'],
        name: item['Denominação'],
        unit: item['Unid. Med.'],
        balancedQuantity: item['Qt.'],
        value: item.Valor.replace(/\./g, '')
          .replace(/,/g, '.')
          .replace(/[^0-9\.]+/g, ''),
        quantity: item['Qt.'],
      }));

      // verificar se os materiais existem na lista de inventário, retornar só os que existem
      const foundObjects = materials.filter((obj) =>
        inventoryData.some(
          (objToFind) =>
            obj.materialId.toString() === objToFind.materialId.toString()
        )
      );

      setFieldValue('MaterialReserveItems', foundObjects);

      // eslint-disable-next-line consistent-return
      setIsLoading(false);
      setOpenCollapse(!openCollapse);
    } catch (err) {
      const status = get(err, 'response.status', 0);

      if (status === 401) {
        toast.error('Você precisa fazer login');
      } else {
        toast.error(err.message);
      }

      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Focus on inputRef
    if (inputRef.current) {
      inputRef.current.focus();
    }

    async function getUsersData() {
      try {
        setIsLoading(true);
        const response = await axiosRest.get('/users/');
        setUsers(response.data);
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
        const response = await axiosRest.get('/workers/');
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

    getMaterialsData();
    getUsersData();
    getWorkersData();
  }, []);

  const handleStore = async (values, resetForm) => {
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

    formattedValues.userId = userId;
    formattedValues.workerId = formattedValues.workerId?.value;
    formattedValues.authorizedBy = formattedValues.authorizedBy?.value;
    formattedValues.reqMaterial = formattedValues.reqMaterial?.value;
    formattedValues.MaterialReserveItems.forEach((item) => {
      delete Object.assign(item, { MaterialId: item.materialId }).materialId; // rename key
    });

    formattedValues.value = formattedValues.MaterialReserveItems.reduce(
      (ac, item) => {
        ac += Number(item.quantity) * Number(item.value);
        return ac;
      },
      0
    );

    try {
      setIsLoading(true);

      console.log(formattedValues);
      // RESERVA, ATUALIZA O INVENTARIO E JA BLOQUEIA
      await axiosRest.post(`/materials/reserve/`, formattedValues);

      setIsLoading(false);
      setOpenCollapse(false);
      resetForm();
      getMaterialsData();

      toast.success(`Reserva de material realizada com sucesso`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  async function getReqMaterialsData(reqMaintenance) {
    try {
      setIsLoading(true);
      const response = await axiosRest.get(
        `/materials/in/rl/${reqMaintenance}`
      );
      setReqRMs(response.data);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
    }
  }

  const handleQuantityChange = (e, balance, handleChange) => {
    // if (Number(e.target.value) > Number(balance)) {
    //   toast.error('A reserva não pode superar o saldo do material');
    //   e.target.value = Number(balance);
    //   handleChange(e);
    //   return;
    // } //LIBERAR POR ENQUANTO QUE NAO TEM O SALDO INICIAL
    if (e.target.value < 0) {
      toast.error('A reserva não pode ser negativa');
      e.target.value = 0;
      handleChange(e);
      return;
    }
    handleChange(e);
  };

  const formatReq = (req) => {
    const currentYear = new Date().getFullYear();
    return req.includes('/') ? req : `${req}/${currentYear}`;
  };

  const initialValues = {
    reqMaintenance: '',
    intendedUse: new Date().toISOString().split('T')[0],
    authorizedBy: { value: userId, label: userName },
    workerId: '',
    place: '',
    reqMaterial: '',
    obs: '',
    MaterialReserveItems: [],
    searchMaterial: '',
    RMSipac: '',
  };
  return (
    <>
      <Loading isLoading={isLoading} />
      <Row className="bg-light border rounded d-flex justify-content-center pt-2">
        <Row
          className="px-0 mx-0 py-2 text-center"
          style={{ background: primaryDarkColor, color: 'white' }}
        >
          <span className="fs-5">RESERVA DE MATERIAL</span>
        </Row>
        <Row className="px-0 pt-2">
          <Formik // FORAM DEFINIFOS 2 FORMULÁRIOS POIS O SEGUNDO SÓ VAI APARECER AOÓS A INSERÇÃO DO PRIMEIRO
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              handleStore(values, resetForm);
            }}
          >
            {({
              submitForm,
              resetForm,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              setFieldValue,
              setFieldTouched,
            }) => (
              <Form
                noValidate
                autoComplete="off"
                onKeyPress={(e) => {
                  if (e.ctrlKey && e.code === 'Enter') submitForm(e);
                }}
              >
                <ReleaseItemsModal // modal p/ liberação de materiais
                  handleCancelModal={handleCancelModal}
                  handleClose={handleCloseModalRel}
                  show={showModalRel}
                  setFieldValue={setFieldValue}
                  data={reqInModal}
                />

                <ModalLoginSipac // modal p/ importar RM do sipac através de login
                  handleClose={handleCloseModalLoginSipac}
                  show={showModalLoginSipac}
                  handleCancelModal={handleCancelModal}
                  handleSaveModal={handleSaveModalLoginSipac}
                  setFieldValue={setFieldValue}
                  // eslint-disable-next-line react/jsx-no-bind
                  getCredentials={getCredentials}
                  // push={push}
                  // hiddenItems={values.MaterialReserveItems.map(
                  //   (item) => item.materialId
                  // )}
                  // inventoryData={inventoryData}
                />

                {!openCollapse ? (
                  <Row className="mb-3">
                    <Col xs={12} md={4}>
                      <ToggleButtonGroup
                        type="radio"
                        name="options"
                        defaultValue={1}
                      >
                        <ToggleButton
                          id="tbg-radio-1"
                          value={1}
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setImportSipac(false);
                          }}
                        >
                          Reserva OS
                        </ToggleButton>
                        <ToggleButton
                          id="tbg-radio-2"
                          value={2}
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setImportSipac(true);
                          }}
                        >
                          Importar RM Sipac
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Col>
                  </Row>
                ) : null}

                <Row>
                  <Form.Group
                    as={Col}
                    xs={9}
                    sm={5}
                    md={3}
                    lg={2}
                    controlId="reqMaintenance"
                    className={`pb-3 ${
                      importSipac && !openCollapse ? 'd-none' : ''
                    }`}
                  >
                    <Form.Label>MANUTENÇÃO</Form.Label>
                    <Form.Control
                      type="tel"
                      value={values.reqMaintenance}
                      onChange={handleChange}
                      autoFocus
                      ref={inputRef}
                      placeholder="Nº OS"
                      onBlur={handleBlur}
                      readOnly={!!openCollapse}
                    />
                    {touched.reqMaintenance && !!errors.reqMaintenance ? (
                      <Badge bg="danger">{errors.reqMaintenance}</Badge>
                    ) : null}
                  </Form.Group>

                  {!openCollapse ? (
                    <Col
                      xs="auto"
                      className={`ps-1 pt-4 ${importSipac ? 'd-none' : ''}`}
                    >
                      <Button
                        type="submit"
                        variant="success"
                        onClick={(e) => {
                          e.preventDefault();
                          if (
                            !!values.reqMaintenance &&
                            !errors.reqMaintenance
                          ) {
                            setOpenCollapse(!openCollapse);
                            setFieldValue(
                              'reqMaintenance',
                              formatReq(values.reqMaintenance) // formatar o numero da requisicao
                            );
                            getReqMaterialsData(
                              formatReq(values.reqMaintenance)
                            );
                          }
                        }}
                        aria-controls="collapse-form"
                        aria-expanded={openCollapse}
                        className="mt-2"
                      >
                        <FaPlus />
                      </Button>
                    </Col>
                  ) : null}

                  <Form.Group
                    as={Col}
                    xs={9}
                    sm={5}
                    md={3}
                    lg={2}
                    controlId="RMSipac"
                    className={`pb-3 ${!importSipac ? 'd-none' : ''}`}
                  >
                    <Form.Label>IMPORTAR RM</Form.Label>
                    <Form.Control
                      type="tel"
                      value={values.RMSipac}
                      onChange={handleChange}
                      placeholder="Nº RM"
                      onBlur={handleBlur}
                      readOnly={!!openCollapse}
                    />
                    {touched.RMSipac && !!errors.RMSipac ? (
                      <Badge bg="danger">{errors.RMSipac}</Badge>
                    ) : null}
                  </Form.Group>

                  {!openCollapse ? (
                    <Col
                      xs="auto"
                      className={`ps-1 pt-4 ${!importSipac ? 'd-none' : ''}`}
                    >
                      <Button
                        type="submit"
                        variant="success"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!!values.RMSipac && !errors.RMSipac) {
                            setFieldValue(
                              'RMSipac',
                              formatReq(values.RMSipac) // formatar o numero da requisicao
                            );
                            handleShowModalLoginSipac(
                              formatReq(values.RMSipac)
                            );
                            // setOpenCollapse(!openCollapse);
                            // getReqMaterialsData(
                            //   formatReq(values.reqMaintenance)
                            // );
                          }
                        }}
                        aria-controls="collapse-form"
                        aria-expanded={openCollapse}
                        className="mt-2"
                      >
                        <FaArrowAltCircleDown />
                      </Button>
                    </Col>
                  ) : null}

                  {openCollapse ? (
                    <>
                      <Form.Group
                        as={Col}
                        xs={12}
                        md={3}
                        lg={2}
                        className="pb-3"
                        controlId="reqMaterial"
                      >
                        <Form.Label>RMs VINCULADAS</Form.Label>
                        <Select
                          inputId="reqMaterial"
                          options={reqRMs.map((reqRM) => ({
                            value: reqRM.req,
                            label: reqRM.req,
                          }))}
                          value={values.reqMaterial}
                          onChange={(selected) => {
                            handleShowModalRel(
                              reqRMs.find(
                                (item) => item.req === selected.value
                              ) ?? []
                            );
                          }}
                          onBlur={handleBlur}
                          placeholder="Selecione a RM"
                          isDisabled={
                            values.MaterialReserveItems.length > 0 ||
                            importSipac
                          }
                        />
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        xs={12}
                        md={3}
                        lg={2}
                        className="pb-3"
                        controlId="intendedUse"
                      >
                        <Form.Label>RETIRAR EM:</Form.Label>
                        <Form.Control
                          type="date"
                          value={values.intendedUse}
                          onChange={handleChange}
                          // isInvalid={touched.intendedUse && !!errors.intendedUse}
                          // isValid={touched.place && !errors.place}
                          onBlur={handleBlur}
                          placeholder="Escolha a data"
                        />
                        {touched.intendedUse && !!errors.intendedUse ? (
                          <Badge bg="danger">{errors.intendedUse}</Badge>
                        ) : null}
                      </Form.Group>

                      <Form.Group
                        as={Col}
                        // xs={12}
                        // md={6}
                        // lg={6}
                        className="pb-3"
                      >
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
                        />
                        {touched.authorizedBy && !!errors.authorizedBy ? (
                          <Badge bg="danger">{errors.authorizedBy}</Badge>
                        ) : null}
                      </Form.Group>
                    </>
                  ) : null}
                </Row>

                <Collapse in={openCollapse}>
                  <Col id="collapse-form">
                    <Row>
                      <Form.Group
                        as={Col}
                        xs={12}
                        md={4}
                        // controlId="workerId"
                        className="pb-3"
                      >
                        <Form.Label>RESERVA PARA:</Form.Label>
                        <Select
                          // id="workerId"
                          inputId="workerId"
                          // name="workerId"
                          options={workers.map((value) => ({
                            label: value[0],
                            options: value[1].map((item) => ({
                              value: item.id,
                              label: item.name,
                            })),
                          }))}
                          formatGroupLabel={formatGroupLabel}
                          value={values.workerId}
                          onChange={(selected) => {
                            setFieldValue('workerId', selected);
                          }}
                          placeholder="Selecione o profissional"
                          // onBlur={handleBlur}
                        />
                        {touched.workerId && !!errors.workerId ? (
                          <Badge bg="danger">{errors.workerId}</Badge>
                        ) : null}
                      </Form.Group>
                      <Form.Group
                        as={Col}
                        xs={12}
                        md={8}
                        className="pb-3"
                        controlId="place"
                      >
                        <Form.Label>LOCAL DE USO:</Form.Label>
                        <Form.Control
                          type="text"
                          value={values.place}
                          onChange={handleChange}
                          isInvalid={touched.place && !!errors.place}
                          // isValid={touched.place && !errors.place}
                          onBlur={(e) => {
                            setFieldValue(
                              'place',
                              e.target.value.toUpperCase()
                            ); // UPPERCASE
                            handleBlur(e);
                          }}
                          placeholder="Informações sobre a localização do serviço"
                        />
                        <Form.Control.Feedback
                          tooltip
                          type="invalid"
                          style={{ position: 'static' }}
                        >
                          {errors.place}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>

                    <Row>
                      <Form.Group xs={12} className="pb-3" controlId="obs">
                        <Form.Label>OBSERVAÇÕES GERAIS:</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          type="text"
                          value={values.obs}
                          onChange={handleChange}
                          isInvalid={touched.obs && !!errors.obs}
                          // isValid={touched.obs && !errors.obs}
                          placeholder="Observações gerais"
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
                    </Row>

                    <Row
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">LISTA DE MATERIAIS</span>
                    </Row>

                    <FieldArray name="MaterialReserveItems">
                      {(fieldArrayProps) => {
                        const { remove, push } = fieldArrayProps;
                        return (
                          <>
                            <Row className="d-flex align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                              <Col sm="12" md="auto">
                                PESQUISA RÁPIDA:
                              </Col>
                              <Col>
                                {' '}
                                <Select
                                  inputId="searchMaterial"
                                  options={inventoryData.map((material) => ({
                                    value: material,
                                    label: `(${material.materialId}) ${material.name} - ${material.unit}`,
                                  }))}
                                  value={values.searchMaterial}
                                  onChange={(selected, action) => {
                                    handlePushItem(
                                      push,
                                      selected,
                                      values.MaterialReserveItems
                                    );
                                    setFieldValue('searchMaterial', '');
                                  }}
                                  placeholder="Selecione o material"
                                  onBlur={() =>
                                    setFieldValue('searchMaterial', '')
                                  }
                                  escapeClearsValue
                                  filterOption={filterOptions}
                                />
                              </Col>
                            </Row>
                            <Row
                              className="border-top"
                              style={{ background: body2Color }}
                            >
                              <SearchModalInventory // modal p/ pesquisa de materiais
                                handleClose={handleCloseModalSearch}
                                show={showModalSearch}
                                push={push}
                                hiddenItems={values.MaterialReserveItems.map(
                                  (item) => item.materialId
                                )}
                                inventoryData={inventoryData}
                              />

                              {values.MaterialReserveItems.length > 0 &&
                                values.MaterialReserveItems.map(
                                  (item, index) => (
                                    <>
                                      <Row className="d-block d-lg-none">
                                        <Col className="fw-bold">
                                          Item nº {index + 1}
                                        </Col>
                                      </Row>
                                      <Row
                                        key={item.materialId}
                                        className="d-flex p-0 m-0 border-bottom"
                                      >
                                        <Form.Group
                                          as={Col}
                                          xs={12}
                                          lg={2}
                                          controlId={`MaterialReserveItems[${index}].materialId`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                              CODIGO
                                            </Form.Label>
                                          ) : null}
                                          <Form.Control
                                            type="text"
                                            plaintext
                                            readOnly
                                            value={item.materialId}
                                            onChange={handleChange}
                                            placeholder="Selecione o ID material"
                                            onBlur={handleBlur}
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                          />
                                        </Form.Group>
                                        <Form.Group
                                          as={Col}
                                          controlId={`MaterialReserveItems[${index}].name`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                              DESCRIÇÃO
                                            </Form.Label>
                                          ) : null}
                                          <div className="px-2">
                                            {item.name}
                                          </div>
                                        </Form.Group>
                                        <Form.Group
                                          as={Col}
                                          xs={12}
                                          lg={1}
                                          controlId={`MaterialReserveItems[${index}].unit`}
                                          className="border-0 m-0 p-0"
                                        >
                                          {index === 0 ? (
                                            <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                              UND
                                            </Form.Label>
                                          ) : null}
                                          <div className="px-2">
                                            {item.unit}
                                          </div>
                                        </Form.Group>
                                        <Form.Group
                                          as={Col}
                                          xs={12}
                                          lg={1}
                                          controlId={`MaterialReserveItems[${index}].balancedQuantity`}
                                          className="d-none"
                                        >
                                          <Form.Control
                                            type="number"
                                            plaintext
                                            value={item.balancedQuantity}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="SALDO"
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                          />
                                        </Form.Group>
                                        <Form.Group
                                          as={Col}
                                          xs={12}
                                          lg={1}
                                          controlId={`MaterialReserveItems[${index}].value`}
                                          className="d-none"
                                        >
                                          <Form.Control
                                            type="number"
                                            plaintext
                                            value={item.value}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="VALOR"
                                            size="sm"
                                            className="p-0 m-0 ps-2"
                                            tabindex="-1"
                                          />
                                        </Form.Group>

                                        <Col
                                          xs={12}
                                          lg={2}
                                          className="d-flex justify-content-between"
                                        >
                                          <Form.Group
                                            as={Col}
                                            xs={10}
                                            sm={4}
                                            md="auto"
                                            controlId={`MaterialReserveItems[${index}].quantity`}
                                            className="border-0 m-0 p-0"
                                            style={{ width: '70px' }}
                                          >
                                            {index === 0 ? (
                                              <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
                                                QTD
                                              </Form.Label>
                                            ) : null}
                                            <Form.Control
                                              type="number"
                                              plaintext
                                              value={item.quantity}
                                              onChange={(e) =>
                                                handleQuantityChange(
                                                  e,
                                                  item.balancedQuantity,
                                                  handleChange
                                                )
                                              }
                                              onBlur={handleBlur}
                                              placeholder="QTD"
                                              size="sm"
                                              className="p-0 m-0 ps-2 pe-2 text-end"
                                              step="any"
                                            />
                                          </Form.Group>
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
                                  )
                                )}
                            </Row>
                          </>
                        );
                      }}
                    </FieldArray>
                    <Row className="pt-4">
                      <Col xs="auto">
                        {touched.MaterialReserveItems &&
                        typeof errors.MaterialReserveItems === 'string' ? (
                          <Badge bg="danger">
                            {errors.MaterialReserveItems}
                          </Badge>
                        ) : touched.MaterialReserveItems &&
                          errors.MaterialReserveItems ? (
                          <Badge bg="danger">
                            A quantidade de item não pode ser 0.
                          </Badge>
                        ) : null}
                      </Col>
                    </Row>
                    <Row className="justify-content-between">
                      <Col xs="auto" className="text-center py-2">
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            handleShowModalSearch();
                            setFieldTouched('MaterialReserveItems');
                          }}
                        >
                          <FaSearch /> Pesquisar no saldo comum
                        </Button>
                      </Col>
                      {/* <Col xs="auto" className="text-center py-2">
                        <InputGroup>
                          <InputGroup.Text
                            id="basic-addon3"
                            className="bg-light text-secondary"
                          >
                            Importar RM do SIPAC
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="RMSipac"
                            style={{ width: '120px' }}
                          />
                          <Button
                            id="button-addon2"
                            variant="secondary"
                            size="sm"
                            // type="submit"
                            onClick={(e) => {
                              handleShowModalLoginSipac(
                                formatReq(
                                  e.currentTarget.previousElementSibling.value
                                )
                              );
                              // console.log(
                              //   formatReq(
                              //     e.currentTarget.previousElementSibling.value
                              //   )
                              // );
                              e.currentTarget.previousElementSibling.value = '';
                            }}
                          >
                            <FaArrowAltCircleDown size={16} />
                          </Button>
                        </InputGroup>
                      </Col> */}
                    </Row>
                    <hr />

                    <Row className="justify-content-center">
                      <Col xs="auto" className="text-center pt-2 pb-4">
                        <Button
                          type="reset"
                          variant="warning"
                          onClick={() => {
                            resetForm();
                            setOpenCollapse(false);
                          }}
                        >
                          Limpar
                        </Button>
                      </Col>
                      <Col xs="auto" className="text-center pt-2 pb-4">
                        <Button variant="success" onClick={submitForm}>
                          Confirmar reserva
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Collapse>
              </Form>
            )}
          </Formik>
        </Row>
      </Row>
    </>
  );
}
