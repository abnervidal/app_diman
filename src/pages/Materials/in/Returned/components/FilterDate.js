/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Formik } from 'formik'; // FormValidation
import * as yup from 'yup'; // RulesValidation

import { FaSearch } from 'react-icons/fa';

import { Row, Col, Button, Badge, Form } from 'react-bootstrap';

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

// Get the current date
const currentDate = new Date();

// Get the first day of the current month
// const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// Get ten days before of the current day
const firstDay = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);

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
  useEffect(() => {
    getData(initialValues);
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={(values) => {
        // getData(values);
        getData(values);
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
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
  );
}

export default FilterDate;
