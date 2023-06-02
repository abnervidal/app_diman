/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
import {
  FaPhone,
  FaPlus,
  FaAngleDoubleDown,
  FaRegClone,
  FaTrashAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';
import { primaryDarkColor } from '../../../../config/colors';

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

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

const emptyValues = {
  sections: [],
};

// eslint-disable-next-line react/no-unstable-nested-components
function Recursive({
  values,
  setFieldValue,
  nameArray = 'sections',
  level = 0,
  sectionstypes,
  superIndex,
}) {
  // não ta utilizando
  const changeSuperIndex = (index) => {
    superIndex = `${superIndex}.${index + 1}`;
  };

  return (
    <FieldArray name={nameArray}>
      {({ push, remove, swap }) => {
        const addChild = (section, index) => {
          section.sections.push({
            BuildingSectiontypeId: '',
            name: '',
            cod: '',
            obs: '',
            sections: [],
          });
          // o método swap é só pra atualizar o estado pq nao utilizei funcao nativa do formik para adicionar o form filho
          swap(index, index);
        };
        return (
          <>
            {level === 0 ? (
              <Row className="pb-3">
                <Col xs="auto">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      push({
                        BuildingSectiontypeId: '',
                        name: '',
                        cod: '',
                        obs: '',
                        sections: [],
                      })
                    }
                    // style={{ marginLeft: `${level * 20}px` }}
                  >
                    <FaPlus /> Divisão
                  </Button>
                </Col>
              </Row>
            ) : null}
            <Row>
              {values.sections.map((section, index) => (
                <div key={index}>
                  <Row
                    className={`${level === 0 ? 'mt-3' : 'mt-1'} py-1`}
                    style={{ background: 'rgba(69, 98, 150, 0.25)' }}
                    // style={{ paddingLeft: `${level * 20}px` }}
                  >
                    <Col
                      xs="auto"
                      style={{ paddingLeft: `${2 + level * 20}px` }}
                    >
                      <div
                        className="border px-2  border-dark"
                        style={{ height: '36px' }}
                      >
                        {superIndex ? (
                          <h5>
                            {superIndex}.{index + 1}
                          </h5>
                        ) : (
                          <h5>{index + 1}</h5>
                        )}
                      </div>
                    </Col>
                    <BootstrapForm.Group
                      as={Col}
                      xs={2}
                      controlId={`${nameArray}.${index}.BuildingSectiontypeId`}
                      // className="border-0 m-0 p-0 d-none"
                    >
                      <BootstrapForm.Label className="d-none">
                        BuildingSectiontypeId
                      </BootstrapForm.Label>

                      <Field
                        name={`${nameArray}.${index}.BuildingSectiontypeId`}
                      >
                        {({ field }) => (
                          <Select
                            {...field}
                            as={BootstrapForm.Control}
                            inputId={`${nameArray}.${index}.BuildingSectiontypeId`}
                            options={sectionstypes.map((item) => ({
                              label: item.type,
                              value: item.id,
                            }))}
                            size="sm"
                            value={section.BuildingSectiontypeId}
                            onChange={(selectedOption) =>
                              setFieldValue(
                                `${nameArray}.${index}.BuildingSectiontypeId`,
                                selectedOption
                              )
                            }
                            placeholder="Tipo"
                          />
                        )}
                      </Field>
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      controlId={`${nameArray}.${index}.name`}
                    >
                      <BootstrapForm.Label className="d-none">
                        Descrição
                      </BootstrapForm.Label>
                      <Field
                        name={`${nameArray}.${index}.name`}
                        type="text"
                        as={BootstrapForm.Control}
                        // size="sm"
                        placeholder="Descrição"
                        // className="border-0"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={1}
                      controlId={`${nameArray}.${index}.cod`}
                    >
                      <BootstrapForm.Label className="d-none">
                        Codigo
                      </BootstrapForm.Label>
                      <Field
                        name={`${nameArray}.${index}.cod`}
                        type="text"
                        as={BootstrapForm.Control}
                        // size="sm"
                        placeholder="Cód"
                        // className="border-0"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      as={Col}
                      xs={3}
                      controlId={`${nameArray}.${index}.obs`}
                    >
                      <BootstrapForm.Label className="d-none">
                        Obs
                      </BootstrapForm.Label>
                      <Field
                        name={`${nameArray}.${index}.obs`}
                        type="text"
                        as={BootstrapForm.Control}
                        // size="sm"
                        placeholder="Observações"
                        // className="border-0"
                      />
                    </BootstrapForm.Group>
                    <Col xs={3}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        className="border-0 m-0"
                        onClick={() => remove(index)}
                      >
                        <FaTrashAlt />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        className="border-0 m-0"
                        onClick={() => addChild(section, index)}
                      >
                        <FaAngleDoubleDown />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-secondary"
                        className="border-0 m-0"
                        onClick={() => push(section)}
                      >
                        <FaRegClone />
                      </Button>
                    </Col>
                  </Row>{' '}
                  {section.sections.length > 0 ? (
                    <Recursive
                      values={section}
                      setFieldValue={setFieldValue}
                      level={level + 1}
                      nameArray={`${nameArray}.${index}.sections`}
                      sectionstypes={sectionstypes}
                      superIndex={
                        superIndex
                          ? `${superIndex}.${index + 1}`
                          : `${index + 1}`
                      }
                    />
                  ) : null}
                </div>
              ))}
            </Row>
          </>
        );
      }}
    </FieldArray>
  );
}

function MyForm({ buildingData, initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [sectionstypes, setSectionstypes] = useState(false);
  const [initialData, setInitialData] = useState(emptyValues);

  const isEditMode = useRef(!!initialValues);

  useEffect(() => {
    async function getEditData(idEdit) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `/properties/buildings/sections/${idEdit}`
        );

        setInitialData(response.data);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/properties/buildings/sectionstypes');
        setSectionstypes(response.data);
        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    if (isEditMode.current) {
      getEditData(initialValues.id);
    } else {
      getData();
    }
  }, []);

  const handleStore = async (values, resetForm) => {
    const formattedValues = {
      ...convertEmptyToNull(values),
    };

    const arrayValues = [];

    const flatArray = (array, superId = null) => {
      array.forEach((item) => {
        item.id = uuidv4();
        item.BuildingSipacSubRip = buildingData.subRip;
        item.superId = superId;
        arrayValues.push(item);
        if (item.sections.length > 0) return flatArray(item.sections, item.id);
      });
      return arrayValues;
    };

    flatArray(formattedValues.sections);
    arrayValues.forEach((obj, index) => {
      obj.order = index;
      delete obj.sections;
    });
    console.log(arrayValues);
    console.log(formattedValues.sections.flat());

    // formattedValues.sections.forEach((item) => console.log(item));

    try {
      setIsLoading(true);

      const { data } = await axios.post(
        `/properties/buildings/sections/bulk'`,
        arrayValues
      );

      console.log(data);

      // getEditData(data.id);

      // isEditMode.current = true;

      // resetForm();

      toast.success(`Registro realizado com sucesso!`);

      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      console.log(err);
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <Row className="justify-content-center">
          <Col
            xs={12}
            className=" text-center"
            style={{ background: primaryDarkColor, color: 'white' }}
          >
            <span className="fs-5">
              {isEditMode ? 'Editar' : 'Adicionar'} Divisões em Instalações
              Físicas
            </span>
          </Col>
        </Row>
        <Row className="pt-2">
          <Formik
            initialValues={emptyValues}
            onSubmit={(values, { resetForm }) => {
              handleStore(values, resetForm);
            }}
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
                <h3>{buildingData?.name}</h3>
                <Recursive
                  values={values}
                  setFieldValue={setFieldValue}
                  sectionstypes={sectionstypes}
                />
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
      </Container>
    </>
  );
}

export default MyForm;
