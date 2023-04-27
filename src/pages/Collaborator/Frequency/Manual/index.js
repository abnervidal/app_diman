/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { Button, Row, Col, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';

import * as yup from 'yup'; // RulesValidation
import { Formik, FieldArray } from 'formik'; // FormValidation
import Select from 'react-select';
import axios from '../../../../services/axios';
import {
  primaryDarkColor,
  body1Color,
  body2Color,
} from '../../../../config/colors';
import Loading from '../../../../components/Loading';

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

const formatGroupLabel = (data) => (
  <Col className="d-flex justify-content-between">
    <span>{data.label}</span>
    <Badge bg="secondary">{data.options.length}</Badge>
  </Col>
);

export default function Index() {
  const userId = useSelector((state) => state.auth.user.id);
  const [data, setData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [files, setFiles] = useState([]);

  const handlePushItem = (push, row, list) => {
    // não incluir repetido na lista
    // console.log(row);
    // console.log(list);
    if (list.length > 0) {
      let exists = false;

      list.every((item) => {
        if (item.WorkerId === row.value.id) {
          exists = true;
          return false;
        }
        return true;
      });

      if (exists) {
        toast.error('Item já incluído na lista de saída');
        return;
      }
    }

    // adicionar na lista de saída
    push({
      WorkerId: row.value.id,
      name: row.label,
      job: row.value.job,
      WorkerManualfrequencytypeId: 2,
      hours: 9,
      obs: '',
    });
  };

  const schema = yup.object().shape({
    ContractId: yup.number().required('Requerido'),
    UnidadeId: yup.number().required('Requerido'),
    date: yup.date().required('Requerido'),

    // eslint-disable-next-line react/forbid-prop-types
    WorkerManualfrequencyItems: yup
      .array()
      .of(
        yup.object().shape({
          hours: yup.number().required('Requerido').positive(),
          WorkerManualfrequencytypeId: yup
            .number()
            .required('Requerido')
            .positive(),
        })
      )
      .required()
      .min(1, 'A lista de colaboradores não pode ser vazia'),
  });

  useEffect(() => {
    async function getData() {
      const workersOp = [];
      try {
        setIsLoading(true);
        const response = await axios.get('/workers/actives');

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

        const differentsContracts = Array.from(
          new Set(
            response.data.map((w) =>
              JSON.stringify(w.WorkerContracts[0]?.Contract)
            )
          )
        ).map((json) => JSON.parse(json));
        const differentsUnidades = Array.from(
          new Set(
            response.data.map((w) =>
              JSON.stringify(
                w.WorkerContracts[0]?.Unidade
                  ? w.WorkerContracts[0]?.Unidade
                  : ''
              )
            )
          )
        ).map((json) => JSON.parse(json));

        setWorkers(workersOp);
        setContracts(differentsContracts.filter((item) => item));
        setUnidades(differentsUnidades.filter((item) => item));

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

    formattedValues.materialOuttypeId = 3; // SAÍDA POR DEVOLUÇÃO
    formattedValues.userId = userId;
    formattedValues.ContractId = formattedValues.ContractId?.value;
    formattedValues.workerId = formattedValues.workerId?.value;
    formattedValues.WorkerManualfrequencyItems.forEach((item) => {
      Object.assign(item, { MaterialId: item.WorkerId }); // rename key
    });

    formattedValues.value = formattedValues.WorkerManualfrequencyItems.reduce(
      (ac, item) => {
        ac += Number(item.hours) * Number(item.value);
        return ac;
      },
      0
    );

    let formData;
    if (files.length > 0) {
      formData = toFormData(formattedValues);
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        formData.append('documents', file.file);
      }
    }

    try {
      setIsLoading(true);

      if (files.length > 0) {
        // await axios.post(`/workers/manualfrequency`, formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });
        // for (const pair of formData.entries()) {
        //   console.log(`${pair[0]} - ${pair[1]}`);
        // }
      } else {
        console.log(formattedValues);
        // await axios.post(`/workers/manualfrequency`, formattedValues);
      }

      setIsLoading(false);
      setFiles([]);
      resetForm();

      toast.success(
        `Registro de frequência em desenolvimento, em breve estará disponível!`
      );
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      console.log(err);
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const initialValues = {
    ContractId: '',
    UnidadeId: '',
    date: '',
    obs: '',
    WorkerManualfrequencyItems: [],
  };
  return (
    <>
      <Loading isLoading={isLoading} />
      <Row className="bg-light border rounded d-flex justify-content-center pt-2">
        <Row>
          <Col
            xs={12}
            className=" text-center"
            style={{ background: primaryDarkColor, color: 'white' }}
          >
            <span className="fs-5">REGISTRO DE FREQUÊNCIA: MANUAL</span>
          </Col>
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
              <Form noValidate autoComplete="off">
                <Row>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={5}
                    // controlId="workerId"
                    className="pb-3"
                  >
                    <Form.Label>CONTRATO:</Form.Label>
                    <Select
                      inputId="ContractId"
                      options={contracts.map((contract) => ({
                        value: contract.id,
                        label: `${contract.codigoSipac} - ${contract.objeto} `,
                      }))}
                      value={
                        values.ContractId
                          ? unidades.find(
                              (option) => option.value === values.ContractId
                            )
                          : null
                      }
                      onChange={(selected) => {
                        setFieldValue('ContractId', selected.value);
                      }}
                      placeholder="Selecione o contrato"
                      onBlur={handleBlur}
                      isDisabled={values.WorkerManualfrequencyItems.length}
                    />
                    {touched.ContractId && !!errors.ContractId ? (
                      <Badge bg="danger">{errors.ContractId}</Badge>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={4}
                    // controlId="workerId"
                    className="pb-3"
                  >
                    <Form.Label>UNIDADE:</Form.Label>
                    <Select
                      inputId="UnidadeId"
                      options={unidades.map((unidade) => ({
                        value: unidade.id,
                        label: `${unidade.id} - ${unidade.nomeUnidade} `,
                      }))}
                      value={
                        values.UnidadeId
                          ? unidades.find(
                              (option) => option.value === values.UnidadeId
                            )
                          : null
                      }
                      onChange={(selected) => {
                        setFieldValue('UnidadeId', selected.value);
                        setFieldValue(
                          'date',
                          new Date().toISOString().split('T')[0]
                        );
                      }}
                      placeholder="Selecione a unidade"
                      onBlur={(e) => {
                        handleBlur(e);
                      }}
                      isDisabled={values.WorkerManualfrequencyItems.length}
                    />
                    {touched.UnidadeId && !!errors.UnidadeId ? (
                      <Badge bg="danger">{errors.UnidadeId}</Badge>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={3}
                    className="pb-3"
                    controlId="date"
                  >
                    <Form.Label>DATA:</Form.Label>
                    <Form.Control
                      type="date"
                      value={values.date}
                      onChange={handleChange}
                      isInvalid={touched.date && !!errors.date}
                      // isValid={touched.date && !errors.date}
                      onBlur={handleBlur}
                      placeholder="Selecione a data"
                    />
                    <Form.Control.Feedback
                      tooltip
                      type="invalid"
                      style={{ position: 'static' }}
                    >
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group xs={12} className="pb-3" controlId="obs">
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
                </Row>

                <Row
                  className="text-center"
                  style={{ background: primaryDarkColor, color: 'white' }}
                >
                  <span className="fs-6">LISTA DE COLABORADORES</span>
                </Row>
                <FieldArray name="WorkerManualfrequencyItems">
                  {(fieldArrayProps) => {
                    const { remove, push } = fieldArrayProps;
                    return (
                      <>
                        <Row className="d-flex align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
                          {/* <Col sm="12" md="auto">
                            PESQUISA RÁPIDA:
                          </Col> */}
                          <Col>
                            {' '}
                            <Select
                              inputId="searchWorker"
                              options={workers.map((value) => ({
                                label: value[0],
                                options: value[1]
                                  .filter(
                                    // filtrando por contrato e unidade
                                    (v) =>
                                      v.WorkerContracts[0]?.unidadeId ===
                                        values.UnidadeId &&
                                      v.WorkerContracts[0]?.ContractId ===
                                        values.ContractId
                                  )
                                  .filter(
                                    // nao pode adicionar o mesmo item 2x
                                    (item) =>
                                      !values.WorkerManualfrequencyItems.find(
                                        (element) =>
                                          element.WorkerId === item.id
                                      )
                                  )
                                  .map((item) => ({
                                    value: item,
                                    label: item.name,
                                  })),
                              }))}
                              formatGroupLabel={formatGroupLabel}
                              value={null}
                              onChange={(selected, action) => {
                                console.log(selected);
                                console.log(values.WorkerManualfrequencyItems);
                                handlePushItem(
                                  push,
                                  selected,
                                  values.WorkerManualfrequencyItems
                                );
                                setFieldValue('searchWorker', '');
                              }}
                              placeholder="Selecione o profissional"
                              onBlur={() => setFieldValue('searchWorker', '')}
                              escapeClearsValue
                              filterOption={filterOptions}
                            />
                          </Col>
                        </Row>
                        <Row style={{ background: body2Color }}>
                          {values.WorkerManualfrequencyItems.length > 0 &&
                            values.WorkerManualfrequencyItems.map(
                              (item, index) => (
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
                                    <Form.Group
                                      as={Col}
                                      xs={12}
                                      lg={2}
                                      controlId={`WorkerManualfrequencyItems[${index}].WorkerId`}
                                      className="border-0 m-0 p-0 d-none"
                                    >
                                      {index === 0 ? (
                                        <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                          ID
                                        </Form.Label>
                                      ) : null}
                                      <Form.Control
                                        type="text"
                                        plaintext
                                        readOnly
                                        value={item.WorkerId}
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
                                      controlId={`WorkerManualfrequencyItems[${index}].name`}
                                      className="border-0 m-0 p-0"
                                    >
                                      {index === 0 ? (
                                        <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                          NOME
                                        </Form.Label>
                                      ) : null}
                                      <div className="px-2">{item.name}</div>
                                    </Form.Group>

                                    <Form.Group
                                      as={Col}
                                      lg={2}
                                      controlId={`WorkerManualfrequencyItems[${index}].job`}
                                      className="border-0 m-0 p-0"
                                    >
                                      {index === 0 ? (
                                        <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                          FUNÇÃO
                                        </Form.Label>
                                      ) : null}
                                      <div className="px-2">{item.job}</div>
                                    </Form.Group>

                                    <Form.Group
                                      as={Col}
                                      xs={12}
                                      md="auto"
                                      controlId={`WorkerManualfrequencyItems[${index}].WorkerManualfrequencytypeId`}
                                      className="border-0 m-0 p-0"
                                    >
                                      {index === 0 ? (
                                        <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                          TIPO
                                        </Form.Label>
                                      ) : null}

                                      <Form.Select
                                        type="text"
                                        value={item.WorkerManualfrequencytypeId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="p-0 m-0 ps-2 pe-3 border-0"
                                        style={{ width: '130px' }}
                                      >
                                        <option value="1">PRESENÇA</option>
                                        <option value="2">FALTA</option>
                                        <option value="3">ABONO</option>
                                      </Form.Select>
                                    </Form.Group>

                                    <Form.Group
                                      as={Col}
                                      xs={12}
                                      sm={4}
                                      md="auto"
                                      controlId={`WorkerManualfrequencyItems[${index}].hours`}
                                      className="border-0 m-0 p-0"
                                      style={{ width: '70px' }}
                                    >
                                      {index === 0 ? (
                                        <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
                                          HORAS
                                        </Form.Label>
                                      ) : null}
                                      <Form.Control
                                        type="number"
                                        plaintext
                                        value={item.hours}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="HORAS"
                                        size="sm"
                                        className="p-0 m-0 ps-2 pe-2 text-end"
                                        step="any"
                                      />
                                    </Form.Group>

                                    <Col
                                      xs={12}
                                      md={12}
                                      lg={4}
                                      className="d-flex justify-content-between"
                                    >
                                      <Form.Group
                                        as={Col}
                                        xs={10}
                                        controlId={`WorkerManualfrequencyItems[${index}].obs`}
                                        className="d-none d-md-block border-0 m-0 p-0"
                                      >
                                        {index === 0 ? (
                                          <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                            OBSERVAÇÕES
                                          </Form.Label>
                                        ) : null}
                                        <Form.Control
                                          type="text"
                                          plaintext
                                          value={item.obs}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          size="sm"
                                          className="p-0 m-0 ps-2 pe-2"
                                          placeholder="Observação da ocorrência"
                                        />
                                      </Form.Group>

                                      <Col
                                        xs="2"
                                        className="border-0 m-0 p-0 text-center"
                                      >
                                        {index === 0 ? (
                                          <Row>
                                            <Col xs="auto" className="d-flex">
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
                    {touched.WorkerManualfrequencyItems &&
                    typeof errors.WorkerManualfrequencyItems === 'string' ? (
                      <Badge bg="danger">
                        {errors.WorkerManualfrequencyItems}
                      </Badge>
                    ) : touched.WorkerManualfrequencyItems &&
                      errors.WorkerManualfrequencyItems ? (
                      <Badge bg="danger">
                        A quantidade de item não pode ser 0.
                      </Badge>
                    ) : null}
                  </Col>
                </Row>

                <hr />

                <Row className="justify-content-center">
                  <Col xs="auto" className="text-center pt-2 pb-4">
                    <Button
                      type="reset"
                      variant="warning"
                      onClick={() => {
                        resetForm();
                      }}
                    >
                      Limpar
                    </Button>
                  </Col>
                  <Col xs="auto" className="text-center pt-2 pb-4">
                    <Button variant="success" onClick={submitForm}>
                      Confirmar frequência
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
      </Row>
    </>
  );
}
