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
  carId: '',
  date: '',
  obs: '',
  vistoriador: '',
  conferidor: '',
};

const riskOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const validationSchema = Yup.object().shape({
  // carId: Yup.number().required('Necessário selecionar o veículo!'),
  // workerId: Yup.string().required('Necessário selecionar o motorista!'),
  // carOccurrencetypeId: Yup.number().required(
  //   'Necessário selecionar o tipo de ocorrência!'
  // ),
  // data: Yup.date().required('Necessário selecionar a data da ocorrência!'),
});

export default function CarInspection({ initialValues = null }) {
  const [isLoading, setIsLoading] = useState(false);
  // const [workers, setWorkers] = useState([]);
  // const [cars, setCars] = useState([]);
  // const [occurrencestypes, setOccurrencestypes] = useState([]);

  const isEditMode = !!initialValues;

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        // const response = await axios.get('/workers/actives/');
        // const response2 = await axios.get('/cars/');
        // const response3 = await axios.get('/caroccurrence/types');

        // setWorkers(response.data);
        // setCars(response2.data);
        // setOccurrencestypes(response3.data);

        setIsLoading(false);
        console.log(2);
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

  const handleSubmit = async (values, resetForm) => {
    try {
      setIsLoading(true);
      console.log(values);

      // await axios.post(`/car/inspections/`, values);
      setIsLoading(false);
      resetForm();
      toast.success('Vistoria Cadastrada Com Sucesso!');
    } catch (err) {
      setIsLoading(true);
      console.log(values);
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
      setIsLoading(false);
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
              <span className="fs-5">CADASTRAR VISTORIA</span>
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
                      controlId="carId"
                      as={Col}
                      xs={12}
                      md={8}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>CARRO</BootstrapForm.Label>

                      <Field name="carId">
                        {({ field }) => (
                          <Select
                            {...field}
                            className={
                              errors.carId && touched.carId
                                ? 'is-invalid'
                                : null
                            }
                            options={
                              riskOptions
                              // cars.map((item) => ({
                              // value: item.id,
                              // label: `${item.brand}   ${item.model}  -  ${item.plate}`,
                              // }))
                            }
                            value={
                              values.carId
                                ? cars.find(
                                    (option) => option.value === values.carId
                                  )
                                : null
                            }
                            onChange={(selectedOption) =>
                              setFieldValue('carId', selectedOption.value)
                            }
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="carId"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
                    <BootstrapForm.Group
                      controlId="date"
                      as={Col}
                      xs={12}
                      md={4}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        DATA DA VISTORIA
                      </BootstrapForm.Label>
                      <Field
                        xs={6}
                        className={
                          errors.date && touched.date ? 'is-invalid' : null
                        }
                        type="date"
                        name="date"
                        as={BootstrapForm.Control}
                        placeholder="Código"
                      />
                      <ErrorMessage
                        name="date"
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
                      <span className="fs-6">INTERNA</span>
                    </Col>
                  </Row>
                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">EXTERNA</span>
                    </Col>
                  </Row>

                  <Row className="d-flex justify-content-center align-items-center">
                    <Col
                      xs={12}
                      className="text-center"
                      style={{ background: primaryDarkColor, color: 'white' }}
                    >
                      <span className="fs-6">OBSERVAÇÕES</span>
                    </Col>

                    <BootstrapForm.Group
                      controlId="obs"
                      as={Col}
                      xs={12}
                      className="pb-3"
                    >
                      <BootstrapForm.Label>
                        OBSERVAÇÕES IMPORTANTES DA VISTORIA
                      </BootstrapForm.Label>
                      <BootstrapForm.Control
                        as="textarea"
                        rows={3}
                        type="text"
                        value={values.obs}
                        onChange={handleChange}
                        placeholder="Descreva detalhes importantes da vistoria"
                      />
                      <ErrorMessage
                        name="obs"
                        component="div"
                        className="invalid-feedback"
                      />
                    </BootstrapForm.Group>
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
