/* eslint-disable react/prop-types */
import React from 'react';
import { toast } from 'react-toastify';
import { Formik, Field } from 'formik';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import * as Yup from 'yup';
import { FaUser, FaSignInAlt, FaLock } from 'react-icons/fa';

const LoginSchema = Yup.object().shape({
  usernameSipac: Yup.string().required('Campo obrigatório'),
  passwordSipac: Yup.string().required('Campo obrigatório'),
});

function LoginForm({
  handleCancelModal,
  handleSaveModal,
  getCredentials,
  setFieldValue,
}) {
  const initialValues = {
    usernameSipac: '',
    passwordSipac: '',
  };

  const handleStore = (values, { setSubmitting }) => {
    // Handle form submission logic here
    // console.log(values);
    // getCredentials(values);
    handleSaveModal(setFieldValue, values);
    setSubmitting(false);
  };

  return (
    <Container className="pt-2">
      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleStore}
      >
        {({
          isSubmitting,
          errors,
          touched,
          submitForm,
          resetForm,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            {/* <Row>
              <p className="h4 text-center pb-2">Login SIPAC</p>
            </Row> */}
            <Row className="justify-content-center">
              <Form.Group as={Col} xs="12" controlId="usernameSipac">
                {/* <Form.Label>Login</Form.Label> */}
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">
                    <FaUser />
                  </InputGroup.Text>
                  <Field type="text" name="usernameSipac" as={Form.Control} />
                </InputGroup>
                <Badge
                  pill
                  bg="danger"
                  style={{ position: 'static' }}
                  className="mt-0 mb-4"
                >
                  {errors.usernameSipac}
                </Badge>
              </Form.Group>
            </Row>
            <Row className="justify-content-center">
              <Form.Group as={Col} xs="12" controlId="passwordSipac">
                {/* <Form.Label>Senha</Form.Label> */}
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon3">
                    <FaLock />
                  </InputGroup.Text>
                  <Field
                    type="password"
                    name="passwordSipac"
                    as={Form.Control}
                  />

                  <Button
                    id="button-addon1"
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <FaSignInAlt />
                  </Button>
                </InputGroup>
                <Badge
                  pill
                  bg="danger"
                  style={{ position: 'static' }}
                  className="mt-0 mb-4"
                >
                  {errors.passwordSipac}
                </Badge>
              </Form.Group>

              {/* <Button
                // type="submit"
                onClick={submitForm}
                disabled={isSubmitting}
              >
                Submit
              </Button> */}
            </Row>
          </Form>
        )}
      </Formik>
    </Container>
  );
}

export default LoginForm;
