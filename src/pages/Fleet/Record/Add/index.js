/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
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

// import { IMaskInput } from 'react-imask';
import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';
import { primaryDarkColor, body2Color } from '../../../../config/colors';
import PreviewMultipleImages from '../../../../components/PreviewMultipleImages';

const emptyValues = {
  brand: '',
  model: '',
  alias: '',
  color: '',
  plate: '',
  renavan: '',
  year: '',
  chassi: '',
  payload: '',
  weight: '',
  fuelVolume: '',
  peopleCapacity: '',
  obs: '',
  CartypeId: '',
  CarFueltypeId: '',
  CarAccessories: [],
  searchAccessory: '',
  // CarAccessorytypeType: '',
};

const validationSchema = Yup.object().shape({
  CartypeId: Yup.number().required('Necessário selecionar o tipo de veículo!'),
  CarFueltypeId: Yup.number().required('Necessário selecionar o combustível!'),
  brand: Yup.string().required('Necessário inserir a marca!'),
  model: Yup.string().required('Necessário inserir o modelo!'),
  // alias: Yup.string().required('Necessário inserir o apelido!'),
  color: Yup.string().required('Necessário inserir a cor!'),
  plate: Yup.string().required('Necessário inserir a placa!'),
  renavan: Yup.string().required('Necessário inserir o renavan!'),
  chassi: Yup.string().required('Necessário inserir o chassi!'),
  year: Yup.number().required('Necessário inserir o ano!'),
});

export default function Car({ data = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fuelOptions, setFuelOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryAccessory, setCategoryAccessory] = useState([]);
  const [files, setFiles] = useState([]);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [initialValues, setInitialValues] = useState(data);

  const isEditMode = !!initialValues;
  // const isEditMode = useRef(!!initialValues);
  // if (isEditMode) console.log(initialValues);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/cars/fuel');
        const response2 = await axios.get('/cars/types');
        const response3 = await axios.get('/cars/accessories/types');
        setFuelOptions(response.data);
        setCategoryOptions(response2.data);
        setCategoryAccessory(response3.data);

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

  const handlePushItem = (push, row, list) => {
    // não incluir repetido na lista
    // console.log(row);
    console.log(row.value);
    // console.log(list);
    if (list.length > 0) {
      let exists = false;
      console.log(1);
      list.every((item) => {
        if (item.CarAccessorytypeId === row.value.id) {
          exists = true;
          return false;
        }
        return true;
      });

      if (exists) {
        toast.error('Acessório já incluído na lista');
        return;
      }
    }

    // adicionar na lista de saída
    push({
      // carId: row.id,
      CarAccessorytypeId: row.value.id,
      CarAccessorytypeType: row.value.type,
    });
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

  const handleSubmit = async (values, resetForm) => {
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

    let addList;
    let deleteList;
    let updateList;

    formattedValues.CarId = values.id;

    let formData;
    if (files.length > 0) {
      formData = toFormData(formattedValues);
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        formData.append('photos', file.file);
      }
    }

    if (isEditMode) {
      addList = [
        ...formattedValues.CarAccessories.filter(
          (initialItem) =>
            !initialValues.CarAccessories.some(
              (item) =>
                initialItem.CarAccessorytypeId === item.CarAccessorytypeId
            )
        ),
      ];

      addList.forEach((item) => (item.CarId = formattedValues.id));

      deleteList = [
        ...initialValues.CarAccessories.filter(
          (initialItem) =>
            !formattedValues.CarAccessories.some(
              (item) =>
                initialItem.CarAccessorytypeId === item.CarAccessorytypeId
            )
        ),
      ];

      deleteList.forEach((item) => (item.CarId = formattedValues.id));

      updateList = [
        ...formattedValues.CarAccessories.filter((initialItem) =>
          initialValues.CarAccessories.some(
            (item) => initialItem.CarAccessorytypeId === item.CarAccessorytypeId
          )
        ),
      ];
      updateList.forEach((item) => (item.CarId = formattedValues.id));
    }

    try {
      setIsLoading(true);
      if (files.length > 0) {
        await axios.post(`/cars/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        resetForm();
        toast.success('Veículo Cadastrado Com Sucesso!');
      } else if (isEditMode) {
        console.log(initialValues);
        await axios.put(`/cars/${initialValues.id}`, formattedValues);
        if (deleteList.length > 0)
          await axios.delete(`/cars/accessories/`, {
            data: deleteList,
          });

        // ADD AND UPDATE DATA
        const AddANDUpdateList = [...addList, ...updateList];
        console.log('lista', AddANDUpdateList);
        if (AddANDUpdateList.length > 0)
          await axios.post(`/cars/accessories/`, AddANDUpdateList);

        toast.success('Veículo Editado Com Sucesso!');
      } else {
        await axios.post(`/cars/`, formattedValues);
        resetForm();
        toast.success('Veículo Cadastrado Com Sucesso!');
      }
      setFiles([]);
      setIsLoading(false);
      setOpenCollapse(false);
    } catch (err) {
      setIsLoading(true);
      console.log(values);
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
      toast.error('ERRO, entre em contato com os devenvolvedores!');
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
              <span className="fs-5">CADASTRO DE VEÍCULOS</span>
            </Col>
          </Row>
          <Row className="pt-2">
            <Formik
              initialValues={initialValues || emptyValues}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                handleSubmit(values, resetForm);
              }}
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
                      as={Col}
                      xs={12}
                      lg={6}
                      controlId="CartypeId"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CATEGORIA</BootstrapForm.Label>

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
                            value={
                              values.CartypeId
                                ? categoryOptions.find(
                                    (option) =>
                                      option.value === values.CartypeId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('CartypeId', selectedOption.value)
                            }
                            placeholder="Selecione a unidade"
                            onBlur={handleBlur}
                            isInvalid={touched.CartypeId && !!errors.CartypeId}
                            isValid={touched.CartypeId && !errors.CartypeId}
                          />
                        )}
                      </Field>

                      <ErrorMessage
                        name="CartypeId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={6}
                      controlId="alias"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>APELIDO</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="alias"
                        as={BootstrapForm.Control}
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
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={3}
                      controlId="brand"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MARCA</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="brand"
                        as={BootstrapForm.Control}
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
                      />
                      <ErrorMessage
                        name="brand"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={6}
                      controlId="model"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>MODELO</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="model"
                        as={BootstrapForm.Control}
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
                      />
                      <ErrorMessage
                        name="model"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      md={3}
                      controlId="color"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>COR</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="color"
                        as={BootstrapForm.Control}
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
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={6}
                      controlId="renavan"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>RENAVAN</BootstrapForm.Label>

                      <Field
                        type="number"
                        name="renavan"
                        as={BootstrapForm.Control}
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
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={3}
                      controlId="plate"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>PLACA</BootstrapForm.Label>
                      <Field
                        type="text"
                        name="plate"
                        as={BootstrapForm.Control}
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
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={3}
                      controlId="year"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>ANO</BootstrapForm.Label>
                      <Field
                        type="number"
                        name="year"
                        as={BootstrapForm.Control}
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
                    </BootstrapForm.Group>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={4}
                      controlId="CarFueltypeId"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>COMBUSTÍVEL</BootstrapForm.Label>

                      <Field name="CarFueltypeId">
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId="CarFueltypeId"
                            className={
                              errors.CarFueltypeId && touched.CarFueltypeId
                                ? 'is-invalid'
                                : null
                            }
                            options={fuelOptions.map((item) => ({
                              value: item.id,
                              label: item.type,
                            }))}
                            value={
                              values.CarFueltypeId
                                ? fuelOptions.find(
                                    (option) =>
                                      option.value === values.CarFueltypeId
                                  )
                                : null
                            }
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
                        )}
                      </Field>

                      <ErrorMessage
                        name="CarFueltypeId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={4}
                      controlId="chassi"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CHASSI</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="chassi"
                        as={BootstrapForm.Control}
                        value={values.chassi}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.chassi && !!errors.chassi}
                        isValid={touched.chassi && !errors.chassi}
                        placeholder="Insira o chassi"
                        onBlur={(e) => {
                          setFieldValue('chassi', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="chassi"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={4}
                      controlId="payload"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CARGA ÚTIL</BootstrapForm.Label>

                      <Field
                        type="text"
                        name="payload"
                        as={BootstrapForm.Control}
                        value={values.payload}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.payload && !!errors.payload}
                        isValid={touched.payload && !errors.payload}
                        placeholder="Carga do veículo"
                        onBlur={(e) => {
                          setFieldValue(
                            'payload',
                            e.target.value.toUpperCase()
                          ); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="payload"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={6}
                      controlId="weight"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        PESO BRUTO TOTAL
                      </BootstrapForm.Label>

                      <Field
                        type="text"
                        name="weight"
                        as={BootstrapForm.Control}
                        value={values.weight}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.weight && !!errors.weight}
                        isValid={touched.weight && !errors.weight}
                        placeholder="Peso do veículo"
                        onBlur={(e) => {
                          setFieldValue('weight', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="weight"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>

                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={3}
                      controlId="fuelVolume"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        VOLUME DO TANQUE
                      </BootstrapForm.Label>

                      <Field
                        type="text"
                        name="fuelVolume"
                        as={BootstrapForm.Control}
                        value={values.fuelVolume}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={touched.fuelVolume && !!errors.fuelVolume}
                        isValid={touched.fuelVolume && !errors.fuelVolume}
                        placeholder="Nível total do tanque"
                        onBlur={(e) => {
                          setFieldValue(
                            'fuelVolume',
                            e.target.value.toUpperCase()
                          ); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="fuelVolume"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={12}
                      lg={3}
                      controlId="peopleCapacity"
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        CAPACIDADE DE PESSOAS
                      </BootstrapForm.Label>

                      <Field
                        type="text"
                        name="peopleCapacity"
                        as={BootstrapForm.Control}
                        value={values.peopleCapacity}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        isInvalid={
                          touched.peopleCapacity && !!errors.peopleCapacity
                        }
                        isValid={
                          touched.peopleCapacity && !errors.peopleCapacity
                        }
                        placeholder=""
                        onBlur={(e) => {
                          setFieldValue(
                            'peopleCapacity',
                            e.target.value.toUpperCase()
                          ); // UPPERCASE
                          handleBlur(e);
                        }}
                      />
                      <ErrorMessage
                        name="peopleCapacity"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  {/* {openCollapse ? (
                    <Col xs="auto" className="ps-1 pt-4">
                      <Button
                        type="submit"
                        variant="success"
                        // onClick={() => {
                        //   if (
                        //     !!values.reqMaintenance &&
                        //     !errors.reqMaintenance
                        //   ) {
                        //     setOpenCollapse(!openCollapse);
                        //     setFieldValue(
                        //       'reqMaintenance',
                        //       formatReq(values.reqMaintenance) // formatar o numero da requisicao
                        //     );
                        //     getReqMaterialsData(
                        //       formatReq(values.reqMaintenance)
                        //     );
                        //   }
                        // }}
                        aria-controls="collapse-form"
                        aria-expanded={openCollapse}
                        className="mt-2"
                      >
                        <FaPlus />
                      </Button>
                    </Col>
                  ) : null} */}

                  <Row className="d-flex justify-content-center align-items-top">
                    <BootstrapForm.Group
                      controlId="obs"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>OBSERVAÇÕES</BootstrapForm.Label>

                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.obs}
                        onChange={handleChange}
                        isInvalid={touched.obs && !!errors.obs}
                        placeholder="Observações do veículo"
                        onBlur={(e) => {
                          setFieldValue('obs', e.target.value.toUpperCase()); // UPPERCASE
                          handleBlur(e);
                        }}
                        readOnly={!!openCollapse}
                      />

                      <ErrorMessage
                        name="obs"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                  </Row>

                  <Row
                    className="text-center"
                    style={{ background: primaryDarkColor, color: 'white' }}
                  >
                    <span className="fs-6">LISTA DE ACESSÓRIOS</span>
                  </Row>

                  <FieldArray name="CarAccessories">
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
                                inputId="CarAccessorytypeId"
                                options={categoryAccessory.map((item) => ({
                                  value: item,
                                  label: item.type,
                                }))}
                                value={values.CarAccessorytypeId}
                                onChange={(selected, action) => {
                                  handlePushItem(
                                    push,
                                    selected,
                                    values.CarAccessories
                                  );
                                  setFieldValue('CarAccessorytypeId', '');
                                }}
                                placeholder="Selecione o Acessório"
                                onBlur={() =>
                                  setFieldValue('CarAccessorytypeId', '')
                                }
                                escapeClearsValue
                                // filterOption={filterOptions}
                              />
                            </Col>
                          </Row>
                          <Row
                            className="border-top"
                            style={{ background: body2Color }}
                          >
                            {values.CarAccessories.length > 0 &&
                              values.CarAccessories.map((item, index) => (
                                <>
                                  <Row className="d-block d-lg-none">
                                    <Col className="fw-bold">
                                      Item nº {index + 1}
                                    </Col>
                                  </Row>
                                  <Row
                                    key={item.CarAccessorytypeType}
                                    className="d-flex p-0 m-0 border-bottom"
                                  >
                                    <BootstrapForm.Group
                                      as={Col}
                                      xs={12}
                                      lg={3}
                                      controlId={`CarAccessories[${index}].CarAccessorytypeType`}
                                      className="border-0 m-0 p-0"
                                    >
                                      {index === 0 ? (
                                        <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
                                          ACESSÓRIO
                                        </BootstrapForm.Label>
                                      ) : null}
                                      <div className="px-2">
                                        {item.CarAccessorytypeType ||
                                          item.CarAccessorytype.type}
                                      </div>
                                    </BootstrapForm.Group>
                                    {/* ////////////////////////////////////////////////////////////////////////////////////// */}
                                    <Col
                                      xs={12}
                                      lg={9}
                                      className="d-flex justify-content-between"
                                    >
                                      <BootstrapForm.Group
                                        as={Col}
                                        xs={10}
                                        sm={3}
                                        md="auto"
                                        controlId={`CarAccessories[${index}].payload`}
                                        className="border-0 m-0 p-0"
                                        // style={{ width: '70px' }}
                                      >
                                        {index === 0 ? (
                                          <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
                                            CAPACIDADE DE CARGA
                                          </BootstrapForm.Label>
                                        ) : null}
                                        <BootstrapForm.Control
                                          type="string"
                                          plaintext
                                          value={item.payload}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          placeholder="Carga suportada"
                                          size="sm"
                                          className="p-0 m-0 ps-2 pe-2 text-end"
                                          step="any"
                                        />
                                      </BootstrapForm.Group>

                                      <BootstrapForm.Group
                                        as={Col}
                                        xs={10}
                                        sm={3}
                                        md="auto"
                                        controlId={`CarAccessories[${index}].dimension`}
                                        className="border-0 m-0 p-0"
                                        // style={{ width: '70px' }}
                                      >
                                        {index === 0 ? (
                                          <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
                                            TAMANHO
                                          </BootstrapForm.Label>
                                        ) : null}
                                        <BootstrapForm.Control
                                          type="string"
                                          plaintext
                                          value={item.dimension}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          placeholder="Tamanho do acessório"
                                          size="sm"
                                          className="p-0 m-0 ps-2 pe-2 text-end"
                                          step="any"
                                        />
                                      </BootstrapForm.Group>

                                      <BootstrapForm.Group
                                        as={Col}
                                        xs={10}
                                        sm={4}
                                        md="auto"
                                        controlId={`CarAccessories[${index}].obs`}
                                        className="border-0 m-0 p-0"
                                        // style={{ width: '70px' }}
                                      >
                                        {index === 0 ? (
                                          <BootstrapForm.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
                                            OBSERVAÇÃO
                                          </BootstrapForm.Label>
                                        ) : null}
                                        <BootstrapForm.Control
                                          type="text"
                                          plaintext
                                          value={item.obs}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          placeholder="Observações"
                                          size="sm"
                                          className="p-0 m-0 ps-2 pe-2 text-end"
                                          step="any"
                                        />
                                      </BootstrapForm.Group>
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
                  {/* <Row className="pt-4">
                    <Col xs="auto">
                      {touched.MaterialReserveItems &&
                      typeof errors.MaterialReserveItems === 'string' ? (
                        <Badge bg="danger">{errors.MaterialReserveItems}</Badge>
                      ) : touched.MaterialReserveItems &&
                        errors.MaterialReserveItems ? (
                        <Badge bg="danger">
                          A quantidade de item não pode ser 0.
                        </Badge>
                      ) : null}
                    </Col>
                  </Row> */}

                  <Row
                    className="text-center mt-3"
                    style={{ background: primaryDarkColor, color: 'white' }}
                  >
                    <span className="fs-6">REGISTROS FOTOGRÁFICOS</span>
                  </Row>

                  <Row>
                    <PreviewMultipleImages files={files} setFiles={setFiles} />
                  </Row>

                  <Row className="justify-content-center pt-2 pb-4">
                    {isEditMode.current ? null : (
                      <Col xs="auto" className="text-center">
                        <Button variant="warning" type="reset">
                          Limpar
                        </Button>
                      </Col>
                    )}
                    <Col xs="auto" className="text-center">
                      <Button variant="success" type="submit">
                        {isEditMode ? 'Editar' : 'Cadastrar'}
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
