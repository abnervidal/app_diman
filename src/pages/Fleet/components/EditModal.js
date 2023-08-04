// /* eslint-disable no-nested-ternary */
// /* eslint-disable jsx-a11y/no-autofocus */
// /* eslint-disable react/prop-types */
// import React, { useState, useRef, useEffect, useContext } from 'react';
// // import { useSelector } from 'react-redux';
// import { FaRegEdit, FaTrashAlt } from 'react-icons/fa';
// import { Button, Modal, Row, Col, Form, Badge } from 'react-bootstrap';

// import { toast } from 'react-toastify';

// import * as yup from 'yup'; // RulesValidation
// import { Formik, Field, ErrorMessage, FieldArray } from 'formik'; // FormValidation
// import Select from 'react-select';
// // import { initial } from 'lodash';
// import axios from '../../../services/axios';
// import {
//   primaryDarkColor,
//   body1Color,
//   body2Color,
// } from '../../../config/colors';
// import Loading from '../../../components/Loading';
// // import PreviewMultipleImages from '../../../components/PreviewMultipleImages';

// const formatGroupLabel = (data) => (
//   <Col className="d-flex justify-content-between">
//     <span>{data.label}</span>
//     <Badge bg="secondary">{data.options.length}</Badge>
//   </Col>
// );

// export default function EditModal({ show, handleClose, data, handleSave }) {
//   const [fuelOptions, setFuelOptions] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [categoryAccessory, setCategoryAccessory] = useState([]);
//   // const [files, setFiles] = useState([]);
//   const inputRef = useRef();

//   const {
//     brand,
//     model,
//     alias,
//     color,
//     plate,
//     renavan,
//     year,
//     chassi,
//     payload,
//     weight,
//     fuelVolume,
//     peopleCapacity,
//     obs,
//     CartypeId,
//     CarFueltypeId,
//     CarAccessories,
//     id,
//   } = data;

//   const initialValues = {
//     brand,
//     model,
//     alias,
//     color,
//     plate,
//     renavan,
//     year,
//     payload,
//     weight,
//     fuelVolume,
//     peopleCapacity,
//     chassi,
//     obs,
//     CartypeId,
//     CarFueltypeId,
//     CarAccessories,
//   };

//   const schema = yup.object().shape();

//   const handlePushItem = (push, row, list) => {
//     // não incluir repetido na lista
//     // console.log(row);
//     console.log(row.value);
//     // console.log(list);
//     if (list.length > 0) {
//       let exists = false;
//       console.log(1);
//       list.every((item) => {
//         if (item.CarAccessorytypeId === row.value.id) {
//           exists = true;
//           return false;
//         }
//         return true;
//       });

//       if (exists) {
//         toast.error('Acessório já incluído na lista');
//         return;
//       }
//     }

//     // adicionar na lista de saída
//     push({
//       // carId: row.id,
//       CarAccessorytypeId: row.value.id,
//       CarAccessorytypeType: row.value.type,
//     });
//   };

//   useEffect(() => {
//     // Focus on inputRef
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }

//     async function getUsersData() {
//       try {
//         setIsLoading(true);
//         const response = await axios.get('/cars/fuel');
//         const response2 = await axios.get('/cars/types');
//         const response3 = await axios.get('/cars/accessories/types');
//         setFuelOptions(response.data);
//         setCategoryOptions(response2.data);
//         setCategoryAccessory(response3.data);
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

//   const convertEmptyToNull = (obj) => {
//     if (Array.isArray(obj)) {
//       return obj.map((value) => convertEmptyToNull(value));
//     }

//     if (typeof obj === 'object' && obj !== null) {
//       return Object.fromEntries(
//         Object.entries(obj).map(([key, value]) => {
//           if (Array.isArray(value) && value.length === 0) {
//             return [key, value];
//           }
//           return [key, convertEmptyToNull(value) ?? null];
//         })
//       );
//     }

//     return obj ?? null;
//   };

//   const handleUpdate = async (values) => {
//     console.log('values', values);
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

//     // let addList;
//     // let deleteList;
//     // let updateList;

//     formattedValues.CarId = id;

//     console.log('formattedValues', formattedValues);

//     const addList = [
//       ...formattedValues.CarAccessories.filter(
//         (item) =>
//           !initialValues.CarAccessories.some(
//             (initialItem) =>
//               initialItem.CarAccessorytypeId === item.CarAccessorytypeId
//           )
//       ),
//     ];

//     addList.forEach((item) => (item.CarId = id));

//     const deleteList = [
//       ...formattedValues.CarAccessories.filter(
//         (initialItem) =>
//           !initialValues.CarAccessories.some(
//             (item) => initialItem.CarAccessorytypeId === item.CarAccessorytypeId
//           )
//       ),
//     ];

//     deleteList.forEach((item) => (item.CarId = id));

//     const updateList = [
//       ...formattedValues.CarAccessories.filter((initialItem) =>
//         initialValues.CarAccessories.some(
//           (item) => initialItem.CarAccessorytypeId === item.CarAccessorytypeId
//         )
//       ),
//     ];

//     console.log('updateList', updateList);
//     console.log('initialValues', initialValues);

//     updateList.forEach((item) => (item.CarId = id));

//     try {
//       setIsLoading(true);
//       console.log(deleteList);
//       await axios.put(`/cars/${id}`, formattedValues);
//       if (deleteList.length > 0)
//         await axios.delete(`/cars/accessories/`, {
//           data: deleteList,
//         });

//       // ADD AND UPDATE DATA
//       const AddANDUpdateList = [...addList, ...updateList];
//       console.log(AddANDUpdateList);
//       if (AddANDUpdateList.length > 0)
//         await axios.post(`/cars/accessories/`, AddANDUpdateList);
//       console.log(AddANDUpdateList);
//       // } else {

//       // }
//       setIsLoading(false);
//       toast.success(`Edição realizada com sucesso!`);
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
//             <FaRegEdit className="pb-1" /> EDIÇÃO: VEÍCULO
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
//             }) => (
//               <Form noValidate autoComplete="off">
//                 <Row>
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={6}
//                     controlId="CartypeId"
//                     className="pb-3"
//                   >
//                     <Form.Label>CATEGORIA</Form.Label>

//                     <Field name="CartypeId">
//                       {({ field }) => (
//                         <Select
//                           {...field}
//                           inputId="CartypeId"
//                           className={
//                             errors.CartypeId && touched.CartypeId
//                               ? 'is-invalid'
//                               : null
//                           }
//                           options={categoryOptions.map((item) => ({
//                             value: item.id,
//                             label: item.type,
//                           }))}
//                           // styles={}
//                           value={values.CartypeId}
//                           onChange={(selectedOption) =>
//                             setFieldValue('CartypeId', selectedOption.value)
//                           }
//                           placeholder="Selecione a unidade"
//                           onBlur={handleBlur}
//                           isInvalid={touched.CartypeId && !!errors.CartypeId}
//                           isValid={touched.CartypeId && !errors.CartypeId}
//                           isDisabled
//                         />
//                       )}
//                     </Field>
//                     <ErrorMessage
//                       name="CartypeId"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                     {touched.CartypeId && !!errors.CartypeId ? (
//                       <Badge bg="danger">{errors.CartypeId}</Badge>
//                     ) : null}
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     md={6}
//                     controlId="alias"
//                     className="pb-3"
//                   >
//                     <Form.Label>APELIDO</Form.Label>

//                     <Field
//                       type="text"
//                       name="alias"
//                       as={Form.Control}
//                       value={values.alias}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.alias && !!errors.alias}
//                       isValid={touched.alias && !errors.alias}
//                       placeholder="Digite o apelido do veículo"
//                       onBlur={(e) => {
//                         setFieldValue('alias', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="alias"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                   {/* <Col className="pb-3">
//                     <Form.Group>
//                       <Form.Label>AUTORIZADO POR:</Form.Label>
//                       <Select
//                         inputId="authorizedBy"
//                         options={users.map((user) => ({
//                           value: user.id,
//                           label: user.name,
//                         }))}
//                         value={values.authorizedBy}
//                         onChange={(selected) => {
//                           setFieldValue('authorizedBy', selected);
//                         }}
//                         placeholder="Selecione o responsável"
//                         onBlur={handleBlur}
//                         isDisabled
//                       />
//                       {touched.authorizedBy && !!errors.authorizedBy ? (
//                         <Badge bg="danger">{errors.authorizedBy}</Badge>
//                       ) : null}
//                     </Form.Group>
//                   </Col> */}
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     md={3}
//                     controlId="brand"
//                     className="pb-3"
//                   >
//                     <Form.Label>MARCA</Form.Label>

//                     <Field
//                       type="text"
//                       name="brand"
//                       as={Form.Control}
//                       value={values.brand}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.brand && !!errors.brand}
//                       isValid={touched.brand && !errors.brand}
//                       placeholder="Digite a marca do veículo"
//                       onBlur={(e) => {
//                         setFieldValue('brand', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                       disabled
//                     />
//                     <ErrorMessage
//                       name="brand"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     md={6}
//                     controlId="model"
//                     className="pb-3"
//                   >
//                     <Form.Label>MODELO</Form.Label>

//                     <Field
//                       type="text"
//                       name="model"
//                       as={Form.Control}
//                       value={values.model}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.model && !!errors.model}
//                       isValid={touched.model && !errors.model}
//                       placeholder="Digite o modelo do veículo"
//                       onBlur={(e) => {
//                         setFieldValue('model', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                       isDisabled
//                     />
//                     <ErrorMessage
//                       name="model"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     md={3}
//                     controlId="color"
//                     className="pb-3"
//                   >
//                     <Form.Label>COR</Form.Label>

//                     <Field
//                       type="text"
//                       name="color"
//                       as={Form.Control}
//                       value={values.color}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.color && !!errors.color}
//                       isValid={touched.color && !errors.color}
//                       placeholder="Digite a marca do veículo"
//                       onBlur={(e) => {
//                         setFieldValue('color', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="color"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={6}
//                     controlId="renavan"
//                     className="pb-3"
//                   >
//                     <Form.Label>RENAVAN</Form.Label>

//                     <Field
//                       type="number"
//                       name="renavan"
//                       as={Form.Control}
//                       // as={IMaskInput}
//                       mask={Number}
//                       value={values.renavan}
//                       isInvalid={touched.renavan && !!errors.renavan}
//                       placeholder="001234567890"
//                       onBlur={handleBlur}
//                       onAccept={(value, mask) => {
//                         setFieldValue(mask.el.input.id, mask.unmaskedValue);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="renavan"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={3}
//                     controlId="plate"
//                     className="pb-3"
//                   >
//                     <Form.Label>PLACA</Form.Label>

//                     <Field
//                       type="text"
//                       name="plate"
//                       as={Form.Control}
//                       value={values.plate}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.plate && !!errors.plate}
//                       isValid={touched.plate && !errors.plate}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue('plate', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="plate"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={3}
//                     controlId="year"
//                     className="pb-3"
//                   >
//                     <Form.Label>ANO</Form.Label>

//                     <Field
//                       type="number"
//                       name="year"
//                       as={Form.Control}
//                       // as={IMaskInput}
//                       mask={Number}
//                       value={values.year}
//                       isInvalid={touched.year && !!errors.year}
//                       placeholder="Digite o ano"
//                       onBlur={handleBlur}
//                       onAccept={(value, mask) => {
//                         setFieldValue(mask.el.input.id, mask.unmaskedValue);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="year"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={4}
//                     controlId="CarFueltypeId"
//                     className="pb-3"
//                   >
//                     <Form.Label>COMBUSTÍVEL</Form.Label>

//                     <Field name="CarFueltypeId">
//                       {({ field }) => (
//                         <Select
//                           {...field}
//                           inputId="CarFueltypeId"
//                           options={fuelOptions.map((item) => ({
//                             value: item.id,
//                             label: item.type,
//                           }))}
//                           value={
//                             values.CarFueltypeId
//                               ? fuelOptions.find(
//                                   (option) =>
//                                     option.value === values.CarFueltypeId
//                                 )
//                               : null
//                           }
//                           onChange={(selected) => {
//                             setFieldValue('CarFueltypeId', selected.value);
//                           }}
//                           placeholder="Selecione a unidade"
//                           onBlur={handleBlur}
//                           isInvalid={
//                             touched.CarFueltypeId && !!errors.CarFueltypeId
//                           }
//                           isValid={
//                             touched.CarFueltypeId && !errors.CarFueltypeId
//                           }
//                         />
//                       )}
//                     </Field>
//                     <ErrorMessage
//                       name="CarFueltypeId"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={4}
//                     controlId="chassi"
//                     className="pb-3"
//                   >
//                     <Form.Label>CHASSI</Form.Label>

//                     <Field
//                       type="text"
//                       name="chassi"
//                       as={Form.Control}
//                       value={values.chassi}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.chassi && !!errors.chassi}
//                       isValid={touched.chassi && !errors.chassi}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue('chassi', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="chassi"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={4}
//                     controlId="payload"
//                     className="pb-3"
//                   >
//                     <Form.Label>CARGA ÚTIL</Form.Label>

//                     <Field
//                       type="text"
//                       name="payload"
//                       as={Form.Control}
//                       value={values.payload}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.payload && !!errors.payload}
//                       isValid={touched.payload && !errors.payload}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue('payload', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="payload"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>
//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={6}
//                     controlId="weight"
//                     className="pb-3"
//                   >
//                     <Form.Label>PESO BRUTO TOTAL</Form.Label>

//                     <Field
//                       type="text"
//                       name="weight"
//                       as={Form.Control}
//                       value={values.weight}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.weight && !!errors.weight}
//                       isValid={touched.weight && !errors.weight}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue('weight', e.target.value.toUpperCase()); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="weight"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>

//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={3}
//                     controlId="fuelVolume"
//                     className="pb-3"
//                   >
//                     <Form.Label>VOLUME DO TANQUE</Form.Label>

//                     <Field
//                       type="text"
//                       name="fuelVolume"
//                       as={Form.Control}
//                       value={values.fuelVolume}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={touched.fuelVolume && !!errors.fuelVolume}
//                       isValid={touched.fuelVolume && !errors.fuelVolume}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue(
//                           'fuelVolume',
//                           e.target.value.toUpperCase()
//                         ); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="fuelVolume"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                   <Form.Group
//                     as={Col}
//                     xs={12}
//                     lg={3}
//                     controlId="peopleCapacity"
//                     className="pb-3"
//                   >
//                     <Form.Label>CAPACIDADE DE PESSOAS</Form.Label>

//                     <Field
//                       type="text"
//                       name="peopleCapacity"
//                       as={Form.Control}
//                       value={values.peopleCapacity}
//                       onChange={(e) => {
//                         handleChange(e);
//                       }}
//                       isInvalid={
//                         touched.peopleCapacity && !!errors.peopleCapacity
//                       }
//                       isValid={touched.peopleCapacity && !errors.peopleCapacity}
//                       placeholder="BC1D23"
//                       onBlur={(e) => {
//                         setFieldValue(
//                           'peopleCapacity',
//                           e.target.value.toUpperCase()
//                         ); // UPPERCASE
//                         handleBlur(e);
//                       }}
//                     />
//                     <ErrorMessage
//                       name="peopleCapacity"
//                       component="div"
//                       className="invalid-feedback"
//                     />
//                   </Form.Group>
//                 </Row>

//                 <Row className="d-flex justify-content-center align-items-top">
//                   <Form.Group controlId="obs" as={Col} xs={12} className="pb-3">
//                     <Form.Label>OBSERVAÇÕES</Form.Label>
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

//                 <FieldArray name="CarAccessories">
//                   {(fieldArrayProps, index) => {
//                     const { remove, push } = fieldArrayProps;
//                     return (
//                       <>
//                         <Row className="d-flex align-items-center pt-1 pb-1 mb-2 bg-white border-bottom">
//                           <Col sm="12" md="auto">
//                             PESQUISA RÁPIDA:
//                           </Col>
//                           <Col>
//                             {' '}
//                             <Select
//                               inputId="CarAccessorytypeId"
//                               options={categoryAccessory.map((item) => ({
//                                 value: item,
//                                 label: item.type,
//                               }))}
//                               value={values.CarAccessorytypeId}
//                               onChange={(selected, action) => {
//                                 handlePushItem(
//                                   push,
//                                   selected,
//                                   values.CarAccessories
//                                 );
//                                 setFieldValue('CarAccessorytypeId', '');
//                               }}
//                               placeholder="Selecione o Acessório"
//                               onBlur={() =>
//                                 setFieldValue('CarAccessorytypeId', '')
//                               }
//                               escapeClearsValue
//                               // filterOption={filterOptions}
//                             />
//                           </Col>
//                         </Row>

//                         <Row className="d-block d-lg-none">
//                           <Col className="fw-bold">Item nº {index + 1}</Col>
//                         </Row>

//                         <Row
//                           className="border-top"
//                           style={{ background: body2Color }}
//                         >
//                           {values.CarAccessories.length > 0 &&
//                             values.CarAccessories.map((item, index) => (
//                               <>
//                                 <Row className="d-block d-lg-none">
//                                   <Col className="fw-bold">
//                                     Item nº {index + 1}
//                                   </Col>
//                                 </Row>
//                                 <Row
//                                   key={item.CarAccessorytypeType}
//                                   className="d-flex p-0 m-0 border-bottom"
//                                 >
//                                   <Form.Group
//                                     as={Col}
//                                     xs={3}
//                                     lg={3}
//                                     controlId={`CarAccessories[${index}].CarAccessorytypeType`}
//                                     className="border-0 m-0 p-0"
//                                   >
//                                     {index === 0 ? (
//                                       <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-sm-none d-md-none d-lg-block">
//                                         ACESSÓRIO
//                                       </Form.Label>
//                                     ) : null}
//                                     <div className="px-2">
//                                       {item.CarAccessorytypeType ||
//                                         item.CarAccessorytype.type}
//                                     </div>
//                                   </Form.Group>

//                                   <Col
//                                     xs={12}
//                                     lg={9}
//                                     className="d-flex justify-content-between"
//                                   >
//                                     <Form.Group
//                                       as={Col}
//                                       xs={3}
//                                       sm={3}
//                                       md="auto"
//                                       controlId={`CarAccessories[${index}].payload`}
//                                       className="border-0 m-0 p-0"
//                                       // style={{ width: '70px' }}
//                                     >
//                                       {index === 0 ? (
//                                         <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
//                                           CAPACIDADE DE CARGA
//                                         </Form.Label>
//                                       ) : null}
//                                       <Form.Control
//                                         type="string"
//                                         plaintext
//                                         value={item.payload}
//                                         onChange={handleChange}
//                                         onBlur={handleBlur}
//                                         placeholder="Carga suportada"
//                                         size="sm"
//                                         className="p-0 m-0 ps-2 pe-2 text-end"
//                                         step="any"
//                                       />
//                                     </Form.Group>

//                                     <Form.Group
//                                       as={Col}
//                                       xs={3}
//                                       sm={3}
//                                       md="auto"
//                                       controlId={`CarAccessories[${index}].dimension`}
//                                       className="border-0 m-0 p-0"
//                                       // style={{ width: '70px' }}
//                                     >
//                                       {index === 0 ? (
//                                         <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
//                                           TAMANHO
//                                         </Form.Label>
//                                       ) : null}
//                                       <Form.Control
//                                         type="string"
//                                         plaintext
//                                         value={item.dimension}
//                                         onChange={handleChange}
//                                         onBlur={handleBlur}
//                                         placeholder="Tamanho do acessório"
//                                         size="sm"
//                                         className="p-0 m-0 ps-2 pe-2 text-end"
//                                         step="any"
//                                       />
//                                     </Form.Group>

//                                     <Form.Group
//                                       as={Col}
//                                       xs={3}
//                                       sm={4}
//                                       md="auto"
//                                       controlId={`CarAccessories[${index}].obs`}
//                                       className="border-0 m-0 p-0"
//                                       // style={{ width: '70px' }}
//                                     >
//                                       {index === 0 ? (
//                                         <Form.Label className="d-flex ps-2 py-1 border-bottom d-none d-lg-block text-center">
//                                           OBSERVAÇÃO
//                                         </Form.Label>
//                                       ) : null}
//                                       <Form.Control
//                                         type="text"
//                                         plaintext
//                                         value={item.obs}
//                                         onChange={handleChange}
//                                         onBlur={handleBlur}
//                                         placeholder="Observações"
//                                         size="sm"
//                                         className="p-0 m-0 ps-2 pe-2 text-end"
//                                         step="any"
//                                       />
//                                     </Form.Group>
//                                     <Col
//                                       as={Col}
//                                       xs="2"
//                                       sm="auto"
//                                       className="border-0 m-0 p-0 text-center"
//                                     >
//                                       {index === 0 ? (
//                                         <Row>
//                                           <Col xs="auto" className="d-flex">
//                                             <div
//                                               className="d-none d-lg-block"
//                                               style={{
//                                                 width: '6px',
//                                                 height: '34px',
//                                               }}
//                                             />
//                                           </Col>
//                                         </Row>
//                                       ) : null}
//                                       <Row>
//                                         <Col xs="auto">
//                                           <Button
//                                             onClick={() => remove(index)}
//                                             variant="outline-danger"
//                                             size="sm"
//                                             className="border-0"
//                                             tabindex="-1"
//                                           >
//                                             <FaTrashAlt size={18} />
//                                           </Button>
//                                         </Col>
//                                       </Row>
//                                     </Col>
//                                   </Col>
//                                 </Row>
//                               </>
//                             ))}
//                         </Row>
//                       </>
//                     );
//                   }}
//                 </FieldArray>

//                 {/* <Row
//                   className="text-center mt-3"
//                   style={{ background: primaryDarkColor, color: 'white' }}
//                 >
//                   <span className="fs-6">REGISTROS FOTOGRÁFICOS</span>
//                 </Row>
//                 <Row>
//                   <PreviewMultipleImages files={files} setFiles={setFiles} />
//                 </Row> */}

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

/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';

import EditModal from '../Record/Add/index';

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
    >
      <Modal.Header closeButton>
        <Modal.Title>Edição</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EditModal
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
