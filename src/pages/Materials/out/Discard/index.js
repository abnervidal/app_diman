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
import PreviewMultipleImages from '../../../../components/PreviewMultipleImages';

import SearchModalInventory from '../components/SearchModalInventory';

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
  const [inventoryData, setinventoryData] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [discardTypes, setDiscardTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModalSearch, setShowModalSearch] = useState(false);
  const [files, setFiles] = useState([]);

  const handleCloseModalSearch = () => setShowModalSearch(false);

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
        toast.error('Item já incluído na lista de saída');
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
    // MaterialOutDiscardtypeId: yup.object().required('Requerido'),
    obs: yup.string().required('Requerido'),
    place: yup.string().required('Requerido'),
    // eslint-disable-next-line react/forbid-prop-types
    MaterialOutItems: yup
      .array()
      .of(
        yup.object().shape({
          quantity: yup.number().required('Requerido').positive(),
          value: yup.number().required('Requerido').positive(),
        })
      )
      .required()
      .min(1, 'A lista de materiais não pode ser vazia'),
  });

  useEffect(() => {
    async function getMaterialsData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/materials/inventory/');
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

    async function getDiscardtypesData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/materials/out/discardtypes');
        setDiscardTypes(response.data);
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

    getWorkersData();
    getMaterialsData();
    getDiscardtypesData();
  }, []);

  const handleQuantityChange = (e, balance, handleChange) => {
    // if (Number(e.target.value) > Number(balance)) {
    //   toast.error('A saída não pode superar o saldo do material');
    //   e.target.value = Number(balance);
    //   handleChange(e);
    //   return;
    // } //LIBERAR POR ENQUANTO QUE NAO TEM O SALDO INICIAL
    if (e.target.value < 0) {
      toast.error('A saída não pode ser negativa');
      e.target.value = 0;
      handleChange(e);
      return;
    }
    handleChange(e);
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
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    Object.keys(formattedValues).forEach((key) => {
      if (formattedValues[key] === '') {
        delete formattedValues[key];
      }
    }); // LIMPANDO CHAVES `EMPTY STRINGS`

    formattedValues.materialOuttypeId = 5; // SAÍDA POR DESCARTE
    formattedValues.userId = userId;
    formattedValues.workerId = formattedValues.workerId?.value;
    // formattedValues.MaterialOutDiscardtypeId =
    //   formattedValues.MaterialOutDiscardtypeId?.value;
    formattedValues.MaterialOutItems.forEach((item) => {
      Object.assign(item, { MaterialId: item.materialId }); // rename key
    });

    formattedValues.value = formattedValues.MaterialOutItems.reduce(
      (ac, item) => {
        ac += Number(item.quantity) * Number(item.value);
        return ac;
      },
      0
    );

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

      if (files.length > 0) {
        await axios.post(`/materials/out/general`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // for (const pair of formData.entries()) {
        //   console.log(`${pair[0]} - ${pair[1]}`);
        // }
      } else {
        console.log(formattedValues);
        await axios.post(`/materials/out/general`, formattedValues);
      }

      setIsLoading(false);
      setFiles([]);
      resetForm();

      toast.success(`Saída de material realizada com sucesso`);
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
    MaterialOutDiscardtypeId: '',
    workerId: '',
    place: '',
    obs: '',
    MaterialOutItems: [],
  };
  return (
    <>
      <Loading isLoading={isLoading} />
      <Row className="bg-light border rounded d-flex justify-content-center pt-2">
        <Row
          className="px-0 mx-0 py-2 text-center"
          style={{ background: primaryDarkColor, color: 'white' }}
        >
          <span className="fs-5">SAÍDA DE MATERIAL: DESCARTE</span>
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
                    lg={3}
                    // controlId="workerId"
                    className="pb-3"
                  >
                    <Form.Label>OCORRÊNCIA:</Form.Label>
                    <Select
                      inputId="MaterialOutDiscardtypeId"
                      options={discardTypes.map((item) => ({
                        value: item.id,
                        label: item.type,
                      }))}
                      value={values.MaterialOutDiscardtypeId}
                      onChange={(selected) => {
                        setFieldValue('MaterialOutDiscardtypeId', selected);
                      }}
                      placeholder="Selecione a ocorrência"
                      onBlur={handleBlur}
                    />
                    {touched.MaterialOutDiscardtypeId &&
                    !!errors.MaterialOutDiscardtypeId ? (
                      <Badge bg="danger">
                        {errors.MaterialOutDiscardtypeId}
                      </Badge>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    xs={12}
                    lg={9}
                    // controlId="workerId"
                    className="pb-3"
                  >
                    <Form.Label>IDENTIFICADO POR: </Form.Label>

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
                      onBlur={handleBlur}
                    />
                    {touched.workerId && !!errors.workerId ? (
                      <Badge bg="danger">{errors.workerId}</Badge>
                    ) : null}
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group
                    as={Col}
                    xs={12}
                    className="pb-3"
                    controlId="place"
                  >
                    <Form.Label>DESTINO DESCARTE:</Form.Label>
                    <Form.Control
                      type="text"
                      value={values.place}
                      onChange={handleChange}
                      isInvalid={touched.place && !!errors.place}
                      // isValid={touched.place && !errors.place}
                      onBlur={(e) => {
                        setFieldValue('place', e.target.value.toUpperCase()); // UPPERCASE
                        handleBlur(e);
                      }}
                      placeholder="Destino do descarte"
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
                      rows={5}
                      type="text"
                      value={values.obs}
                      onChange={handleChange}
                      isInvalid={touched.obs && !!errors.obs}
                      // isValid={touched.obs && !errors.obs}
                      placeholder="Detalhe a situação: Falha no material | Vencido | Obsoleto | Quebra por acidente"
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
                <FieldArray name="MaterialOutItems">
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
                                  values.MaterialOutItems
                                );
                                setFieldValue('searchMaterial', '');
                              }}
                              placeholder="Selecione o material"
                              onBlur={() => setFieldValue('searchMaterial', '')}
                              escapeClearsValue
                              filterOption={filterOptions}
                            />
                          </Col>
                        </Row>
                        <Row style={{ background: body2Color }}>
                          <SearchModalInventory // modal p/ pesquisa de materiais
                            handleClose={handleCloseModalSearch}
                            show={showModalSearch}
                            push={push}
                            hiddenItems={values.MaterialOutItems.map(
                              (item) => item.materialId
                            )}
                            inventoryData={inventoryData}
                          />

                          {values.MaterialOutItems.length > 0 &&
                            values.MaterialOutItems.map((item, index) => (
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
                                    controlId={`MaterialOutItems[${index}].materialId`}
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
                                    controlId={`MaterialOutItems[${index}].name`}
                                    className="border-0 m-0 p-0"
                                  >
                                    {index === 0 ? (
                                      <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                        DESCRIÇÃO
                                      </Form.Label>
                                    ) : null}
                                    <div className="px-2">{item.name}</div>
                                  </Form.Group>
                                  <Form.Group
                                    as={Col}
                                    xs={12}
                                    lg={1}
                                    controlId={`MaterialOutItems[${index}].unit`}
                                    className="border-0 m-0 p-0"
                                  >
                                    {index === 0 ? (
                                      <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block">
                                        UND
                                      </Form.Label>
                                    ) : null}
                                    <div className="px-2">{item.unit}</div>
                                  </Form.Group>
                                  <Form.Group
                                    as={Col}
                                    xs={12}
                                    lg={1}
                                    controlId={`MaterialOutItems[${index}].balancedQuantity`}
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
                                    controlId={`MaterialOutItems[${index}].value`}
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
                                    md={12}
                                    lg={2}
                                    className="d-flex justify-content-between"
                                  >
                                    <Form.Group
                                      as={Col}
                                      xs={10}
                                      sm={4}
                                      md="auto"
                                      controlId={`MaterialOutItems[${index}].quantity`}
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
                            ))}
                        </Row>
                      </>
                    );
                  }}
                </FieldArray>
                <Row className="pt-4">
                  <Col xs="auto">
                    {touched.MaterialOutItems &&
                    typeof errors.MaterialOutItems === 'string' ? (
                      <Badge bg="danger">{errors.MaterialOutItems}</Badge>
                    ) : touched.MaterialOutItems && errors.MaterialOutItems ? (
                      <Badge bg="danger">
                        A quantidade de item não pode ser 0.
                      </Badge>
                    ) : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs="auto" className="text-center py-2">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        handleShowModalSearch();
                        setFieldTouched('MaterialOutItems');
                      }}
                    >
                      <FaSearch /> Pesquisar no cadastro
                    </Button>
                  </Col>
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
                      Confirmar descarte
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
