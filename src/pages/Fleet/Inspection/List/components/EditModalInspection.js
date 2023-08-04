/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';

import EditInspection from '../../Add/index';

export default function ModalEdit(props) {
  const { show, handleSaveModal, handleCancelModal, data, handleClose } = props;

  // Manipulando o botão de voltar do navegador para não sair da página de reserva
  useEffect(() => {
    // Add a fake history event so that the back button does nothing if pressed once
    window.history.pushState(
      'fake-route',
      document.title,
      window.location.href
    );

    addEventListener('popstate', handleCancelModal);

    // Here is the cleanup when this component unmounts
    return () => {
      removeEventListener('popstate', closeQuickView);
      // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
      if (window.history.state === 'fake-route') {
        window.history.back();
      }
    };
  }, []);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="xl"
      // show={show}
      // onHide={handleClose}
      // backdrop="static"
      // keyboard={false}
      // size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edição</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EditInspection
          data={data}
          handleCancelModal={handleCancelModal}
          handleSaveModal={handleSaveModal}
          handleClose={handleClose}
        />
      </Modal.Body>
      {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary">Understood</Button>
      </Modal.Footer> */}
    </Modal>
  );
}

// /* eslint-disable no-nested-ternary */
// /* eslint-disable jsx-a11y/no-autofocus */
// /* eslint-disable react/prop-types */
// import React, { useState, useRef, useEffect, useContext } from 'react';
// import { useSelector } from 'react-redux';
// import { FaRegEdit } from 'react-icons/fa';
// import { Button, Modal, Row, Col, Form, Badge } from 'react-bootstrap';
// import { toast } from 'react-toastify';

// import * as yup from 'yup'; // RulesValidation
// import { Formik, Field, ErrorMessage } from 'formik'; // FormValidation
// import Select from 'react-select';
// import { initial } from 'lodash';
// import axios from '../../../services/axios';
// import {
//   primaryDarkColor,
//   body1Color,
//   body2Color,
// } from '../../../config/colors';
// import Loading from '../../../components/Loading';

// const formatGroupLabel = (data) => (
//   <Col className="d-flex justify-content-between">
//     <span>{data.label}</span>
//     <Badge bg="secondary">{data.options.length}</Badge>
//   </Col>
// );

// export default function EditModal({ show, handleClose, data, handleSave }) {
//   const userId = useSelector((state) => state.auth.user.id);
//   const [isLoading, setIsLoading] = useState(false);
//   const [workers, setWorkers] = useState([]);
//   const inputRef = useRef();
//   const [cars, setCars] = useState([]);

//   const {
//     CarId,
//     WorkerId,
//     milage,
//     date,
//     hourmeter,
//     internal,
//     external,
//     obs,
//     id,
//   } = data;

//   const initialValues = {
//     CarId,
//     WorkerId,
//     milage,
//     date,
//     hourmeter,
//     internal,
//     external,
//     obs,
//   };

//   const schema = yup.object().shape();

//   useEffect(() => {
//     // Focus on inputRef
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }

//     async function getUsersData() {
//       try {
//         setIsLoading(true);
//         const response = await axios.get('/cars/');
//         const response2 = await axios.get('/workers/actives/');
//         setCars(response.data);
//         setWorkers(response2.data);
//         setIsLoading(false);
//       } catch (err) {
//         // eslint-disable-next-line no-unused-expressions
//         err.response?.data?.errors
//           ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
//           : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
//         setIsLoading(false);
//       }
//     }

//     getUsersData();
//   }, []);

//   const handleUpdate = async (values) => {
//     const formattedValues = {
//       ...Object.fromEntries(
//         Object.entries(values).filter(([_, v]) => v != null)
//       ),
//     }; // LIMPANDO CHAVES NULL E UNDEFINED

//     Object.keys(formattedValues).forEach((key) => {
//       if (formattedValues[key] === '') {
//         delete formattedValues[key];
//       }
//     }); // LIMPANDO CHAVES `EMPTY STRINGS`

//     formattedValues.userId = userId;
//     // formattedValues.workerId = formattedValues.workerId?.value;
//     // formattedValues.authorizedBy = formattedValues.authorizedBy?.value;
//     // formattedValues.propertyId = formattedValues.propertyId?.value;
//     // formattedValues.buildingId = formattedValues.buildingId?.value;

//     try {
//       setIsLoading(true);

//       // FAZ A ATUALIZAÇÃO E RETORNA PARA A LISTAGEM
//       await axios.put(`/cars/inspections/${id}`, values);

//       setIsLoading(false);
//       toast.success(`Edição realizada com sucesso`);

//       handleSave();
//     } catch (err) {
//       // eslint-disable-next-line no-unused-expressions
//       err.response?.data?.errors
//         ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
//         : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

//       setIsLoading(false);
//     }
//   };

//   // const formatReq = (req) => {
//   //   if (!req) return;
//   //   const currentYear = new Date().getFullYear();
//   //   return req.includes('/') ? req : `${req}/${currentYear}`;
//   // };

//   return (
//     <Modal
//       show={show}
//       onHide={handleClose}
//       backdrop="static"
//       keyboard={false}
//       size="xl"
//     >
//       {/* <Modal.Header closeButton>
//         <Modal.Title>Editar ... </Modal.Title>
//       </Modal.Header> */}
//       {/* <Modal.Body> */}
//       <Loading isLoading={isLoading} />
//       <Row className="bg-light border rounded d-flex justify-content-center pt-2">
//         <Row
//           className="px-0 mx-0 py-2 text-center"
//           style={{ background: primaryDarkColor, color: 'white' }}
//         >
//           <span className="fs-5">
//             <FaRegEdit className="pb-1" /> EDIÇÃO: OCORRÊNCIAS DO VEÍCULO
//           </span>
//         </Row>
//         <Row className="px-0 pt-2">
//           <Formik
//             initialValues={initialValues}
//             validationSchema={schema}
//             onSubmit={(values) => {
//               handleUpdate(values);
//             }}
//             // enableReinitialize
//           >
//             {({
//               submitForm,
//               handleChange,
//               handleBlur,
//               values,
//               touched,
//               errors,
//               setFieldValue,
//               setFieldTouched,
//             }) => (
//               <Form noValidate autoComplete="off">
//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     controlId="CarId"
//                     as={Col}
//                     xs={12}
//                     md={6}
//                     className="pb-3"
//                   >
//                     <Form.Label>CARRO</Form.Label>

//                     <Field name="CarId">
//                       {({ field }) => (
//                         <Select
//                           {...field}
//                           className={
//                             errors.CarId && touched.CarId ? 'is-invalid' : null
//                           }
//                           options={cars.map((item) => ({
//                             value: item.id,
//                             label: `${item.brand}   ${item.model}  -  ${item.plate}`,
//                           }))}
//                           value={
//                             values.CarId
//                               ? cars.find(
//                                   (option) => option.value === values.CarId
//                                 )
//                               : null
//                           }
//                           onChange={(selectedOption) =>
//                             setFieldValue('CarId', selectedOption.value)
//                           }
//                         />
//                       )}
//                     </Field>
//                     <ErrorMessage
//                       name="CarId"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                   <Form.Group
//                     controlId="milage"
//                     as={Col}
//                     xs={12}
//                     md={3}
//                     className="pb-3"
//                   >
//                     <Form.Label>QUILOMETRAGEM</Form.Label>
//                     <Field
//                       type="number"
//                       as={Form.Control}
//                       // mask={Number}
//                       value={values.milage}
//                       isInvalid={touched.milage && !!errors.milage}
//                       placeholder="100000"
//                       // onBlur={handleBlur}
//                       // onAccept={(value, mask) => {
//                       //   setFieldValue(mask.el.input.id, mask.unmaskedValue);
//                       // }}
//                     />
//                     <ErrorMessage
//                       name="milage"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                   <Form.Group
//                     controlId="date"
//                     as={Col}
//                     xs={12}
//                     md={3}
//                     className="pb-3"
//                   >
//                     <Form.Label>DATA DA VISTORIA</Form.Label>
//                     <Field
//                       xs={6}
//                       className={
//                         errors.date && touched.date ? 'is-invalid' : null
//                       }
//                       type="date"
//                       name="date"
//                       as={Form.Control}
//                       placeholder="Código"
//                     />
//                     <ErrorMessage
//                       name="date"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     controlId="WorkerId"
//                     as={Col}
//                     xs={12}
//                     md={7}
//                     className="pb-3"
//                   >
//                     <Form.Label>MOTORISTA</Form.Label>

//                     <Field name="WorkerId">
//                       {({ field }) => (
//                         <Select
//                           {...field}
//                           inputId="WorkerId"
//                           className={
//                             errors.WorkerId && touched.WorkerId
//                               ? 'is-invalid'
//                               : null
//                           }
//                           options={workers
//                             .filter(
//                               (item) =>
//                                 item.WorkerContracts[0].WorkerJobtypeId === 26
//                             )
//                             .map((item) => ({
//                               label: item.name,
//                               value: item.id,
//                             }))}
//                           value={workers
//                             .filter(
//                               (item) =>
//                                 item.WorkerContracts[0].WorkerJobtypeId === 26
//                             )
//                             .map((item) => ({
//                               label: item.name,
//                               value: item.id,
//                             }))
//                             .find((item) => item.value === values.WorkerId)}
//                           onChange={(selectedOption) =>
//                             setFieldValue('WorkerId', selectedOption.value)
//                           }
//                         />
//                       )}
//                     </Field>
//                     <ErrorMessage
//                       name="WorkerId"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     controlId="hourmeter"
//                     as={Col}
//                     xs={12}
//                     md={5}
//                     className="pb-3"
//                   >
//                     <Form.Label>HORIMETRO</Form.Label>
//                     <Field
//                       type="number"
//                       as={Form.Control}
//                       // mask={Number}
//                       value={values.hourmeter}
//                       isInvalid={touched.hourmeter && !!errors.hourmeter}
//                       placeholder="100000"
//                       // onBlur={handleBlur}
//                       // onAccept={(value, mask) => {
//                       //   setFieldValue(mask.el.input.id, mask.unmaskedValue);
//                       // }}
//                     />
//                     <ErrorMessage
//                       name="hourmeter"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-center">
//                   <Col
//                     xs={12}
//                     className="text-center"
//                     style={{ background: primaryDarkColor, color: 'white' }}
//                   >
//                     <span className="fs-6">INTERNA</span>
//                   </Col>
//                   <Form.Group
//                     controlId="internal"
//                     as={Col}
//                     xs={12}
//                     className="pb-3"
//                   >
//                     <Form.Label>AVARIAS INTERNAS</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       type="text"
//                       value={values.internal}
//                       onChange={handleChange}
//                       placeholder="Descreva detalhes importantes da vistoria"
//                     />
//                     <ErrorMessage
//                       name="internal"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>
//                 <Row className="d-flex justify-content-center align-items-center">
//                   <Col
//                     xs={12}
//                     className="text-center"
//                     style={{ background: primaryDarkColor, color: 'white' }}
//                   >
//                     <span className="fs-6">EXTERNA</span>
//                   </Col>
//                   <Form.Group
//                     controlId="external"
//                     as={Col}
//                     xs={12}
//                     className="pb-3"
//                   >
//                     <Form.Label>AVARIAS EXTERNAS</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       type="text"
//                       value={values.external}
//                       onChange={handleChange}
//                       placeholder="Descreva detalhes importantes da vistoria"
//                     />
//                     <ErrorMessage
//                       name="external"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group controlId="obs" as={Col} xs={12} className="pb-3">
//                     <Form.Label>ESPECIFICAÇÕES DA OCORRÊNCIA</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       type="text"
//                       value={values.obs}
//                       onChange={handleChange}
//                       placeholder="Descreva mais detalhes da ocorrência"
//                     />
//                     <ErrorMessage
//                       name="obs"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <hr />

//                 <Row className="justify-content-center">
//                   <Col xs="auto" className="text-center pt-2 pb-4">
//                     <Button type="reset" variant="danger" onClick={handleClose}>
//                       Cancelar
//                     </Button>
//                   </Col>
//                   <Col xs="auto" className="text-center pt-2 pb-4">
//                     <Button
//                       variant="success"
//                       onClick={(e) => {
//                         submitForm(e);
//                       }}
//                     >
//                       Salvar
//                     </Button>
//                   </Col>
//                 </Row>
//               </Form>
//             )}
//           </Formik>
//         </Row>
//       </Row>
//       {/* </Modal.Body> */}
//       {/* <Modal.Footer>
//         <Button variant="secondary" onClick={handleClose}>
//           Fechar
//         </Button>
//         <Button variant="primary">Entendido</Button>
//       </Modal.Footer> */}
//     </Modal>
//   );
// }
