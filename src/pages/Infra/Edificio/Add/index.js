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
}) {
  return (
    <FieldArray name={nameArray}>
      {({ push, remove, swap }) => {
        const addChild = (section, index) => {
          section.sections.push({ name: '', email: '', sections: [] });
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
                    onClick={() => push({ name: '', email: '', sections: [] })}
                    // style={{ marginLeft: `${level * 20}px` }}
                  >
                    <FaPlus /> Divisão
                  </Button>
                </Col>
              </Row>
            ) : null}
            <Row>
              {values.sections.map((section, index) => (
                <div
                  key={index}
                  style={{ background: 'rgba(69, 98, 150, 0.25)' }}
                >
                  <h3>{index + 1}</h3>
                  <h5>{level + 1}</h5>
                  <Row
                    className={`${level === 0 ? 'pt-3' : 'pt-1'}`}
                    style={{ paddingLeft: `${level * 20}px` }}
                  >
                    <BootstrapForm.Group
                      as={Col}
                      xs={4}
                      controlId={`${nameArray}.${index}.name`}
                      // className="border-0 m-0 p-0 d-none"
                    >
                      <BootstrapForm.Label className="d-none">
                        Name
                      </BootstrapForm.Label>
                      <Field name={`${nameArray}.${index}.name`}>
                        {({ field }) => (
                          <Select
                            {...field}
                            inputId={`${nameArray}.${index}.name`}
                            options={sectionstypes.map((item) => ({
                              label: item.type,
                              value: item.id,
                            }))}
                            size="sm"
                            value={section.name}
                            onChange={(selectedOption) =>
                              setFieldValue(
                                `${nameArray}.${index}.name`,
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
                      xs={4}
                      controlId={`${nameArray}.${index}.email`}
                    >
                      <BootstrapForm.Label className="d-none">
                        Email
                      </BootstrapForm.Label>
                      <Field
                        name={`${nameArray}.${index}.email`}
                        type="email"
                        as={BootstrapForm.Control}
                        // size="sm"
                        placeholder="Nome"
                      />
                    </BootstrapForm.Group>
                    <Col xs={4}>
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

function MyForm({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [sectionstypes, setSectionstypes] = useState(false);

  const isEditMode = !!initialValues;

  useEffect(() => {
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

    getData();
  }, []);

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
          <Formik initialValues={emptyValues}>
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
                <h3>PRÉDIO TAL</h3>
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
