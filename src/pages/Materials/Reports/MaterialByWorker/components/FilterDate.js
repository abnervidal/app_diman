/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Formik } from 'formik'; // FormValidation
import * as yup from 'yup'; // RulesValidation
import { FaSearch } from 'react-icons/fa';
import { Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loading from '../../../../../components/Loading';

const schema = yup.object().shape({
  startDate: yup
    .date()
    .max(
      new Date().toISOString().split('T')[0],
      'Escolha uma data passada para a data de início'
    ),
  // endDate: yup
  //   .date()
  //   .max(
  //     new Date().toISOString().split('T')[0],
  //     'Escolha uma data passada para a data final'
  //   ),
});

// Get the current date in the last instant of day
const currentDate = new Date();
currentDate.setHours(23, 59, 59, 999);

// Get the first day of the current month
const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// Get the first day of the current year
// const firstDay = new Date(new Date().getFullYear(), 0, 1);

// Get ten days before of the current day in the first instant of day
// const firstDay = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);
// firstDay.setHours(0, 0, 0, 0);

// Get the last day of the current month
// const lastDay = new Date(
//   currentDate.getFullYear(),
//   currentDate.getMonth() + 1,
//   0
// );

const initialValues = {
  startDate: firstDay.toISOString().split('T')[0],
  endDate: currentDate.toISOString().split('T')[0],
};

function FilterDate({ getData }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStore = async (values, resetForm) => {
    const formattedValues = {
      ...values,
    };

    console.log(formattedValues);

    const queryString = `?startDate=${formattedValues.startDate}&endDate=${formattedValues.endDate}`;

    try {
      setIsLoading(true);
      getData(queryString);
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

  const handlePushItem = (push, row, list) => {
    console.log(row);
    // adicionar na lista de saída
    push({
      workerId: row.value.id,
      name: row.value.name,
      job: row.value.job,
    });
  };

  return (
    <>
      <Loading isLoading={isLoading} />
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => {
          handleStore(values, resetForm);
        }}
      >
        {({
          submitForm,
          resetForm,
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          touched,
          errors,
          setFieldValue,
        }) => (
          <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Row className="align-items-top">
              <Form.Group
                as={Col}
                xs={12}
                lg={2}
                controlId="startDate"
                className="pb-3"
              >
                <Form.Label>DATA INÍCIO:</Form.Label>
                <Form.Control
                  type="date"
                  value={values.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Início"
                />
                {touched.startDate && !!errors.startDate ? (
                  <Badge bg="danger">{errors.startDate}</Badge>
                ) : null}
              </Form.Group>
              <Form.Group
                as={Col}
                xs={12}
                lg={2}
                controlId="endDate"
                className="pb-3"
              >
                <Form.Label>DATA FINAL:</Form.Label>
                <Form.Control
                  type="date"
                  value={values.endDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Início"
                />
                {touched.endDate && !!errors.endDate ? (
                  <Badge bg="danger">{errors.endDate}</Badge>
                ) : null}
              </Form.Group>
              <Col xs="12" sm="auto" lg={1} className="align-self-end pb-3">
                <Button type="submit" variant="outline-primary">
                  <FaSearch />
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default FilterDate;
