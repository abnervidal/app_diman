/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { get } from 'lodash';
import { toast } from 'react-toastify';
import { FaImages } from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Badge,
  Button,
  OverlayTrigger,
  Image,
} from 'react-bootstrap';

import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import LightGallery from 'lightgallery/react';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

import TableGfilterNestedrow from '../../components/TableGfilterNestedRow';
import TableNestedrow from '../../components/TableNestedRow';

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await axios.get('/cars/');
        setCars(response.data);
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

  const columns = React.useMemo(
    () => [
      {
        // Make an expander cell
        Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
          <span {...getToggleAllRowsExpandedProps()}>
            {isAllRowsExpanded ? '▽' : '▷'}
          </span>
        ),
        id: 'expander', // It needs an ID
        width: 30,
        disableResizing: true,
        Cell: ({ row }) => (
          // Use Cell to render an expander for each row.
          // We can use the getToggleRowExpandedProps prop-getter
          // to build the expander.
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? '▽' : '▷'}
          </span>
        ),
      },
      {
        Header: 'ID',
        accessor: 'id',
        width: 50,
        disableResizing: true,
        isVisible: window.innerWidth > 768,
        // Cell: ({ row }) => {
        //   const getItems = useCallback(
        //     () =>
        //       row.original.CarPhoto.map((item) => (
        //         <a
        //           key={item.order}
        //           // data-lg-size={item.size}
        //           // className="gallery-item"
        //           href={`${
        //             appConfig.url
        //           }/uploads/cars/images/${this.getDataValue('filename')}`}
        //         >
        //           <img
        //             alt={`Imagem ${item.order}`}
        //             // style={{ maxWidth: '280px' }}
        //             className="d-none"
        //             src={`${
        //               appConfig.url
        //             }/uploads/cars/images/${this.getDataValue('filename')}`}
        //             crossOrigin="anonymous"
        //           />
        //           {item.order === 1 ? (
        //             <OverlayTrigger
        //               placement="left"
        //               delay={{ show: 250, hide: 400 }}
        //               overlay={(props) => renderTooltip(props, 'Ver fotos')}
        //             >
        //               <Button
        //                 // size="sm"
        //                 variant="outline-primary"
        //                 className="border-0 m-0"
        //               >
        //                 <FaImages />
        //               </Button>
        //             </OverlayTrigger>
        //           ) : null}
        //         </a>
        //       )),
        //     []
        //   );
        //   return (
        //     <>
        //       {[row.original.length] ? (
        //         <div>
        //           {' '}
        //           <Col xs="auto" className="text-center m-0 p-0 pt-1 px-1">
        //             <LightGallery
        //               // onInit={onInit}
        //               speed={500}
        //               plugins={[lgThumbnail, lgZoom]}
        //             >
        //               {getItems()}
        //             </LightGallery>
        //           </Col>
        //         </div>
        //       ) : null}
        //     </>
        //   );
        // },
        filter: 'includes',
      },
      {
        Header: 'Apelido',
        accessor: 'alias',
        width: 150,
        disableResizing: true,
      },
      {
        Header: 'Marca',
        accessor: 'brand',
      },
      {
        Header: 'Modelo',
        accessor: 'model',
      },
      {
        Header: 'Placa',
        accessor: 'plate',
      },
      {
        Header: 'Categoria',
        accessor: 'CartypeId',
        filter: 'type',
      },
    ],
    []
  );

  const data = React.useMemo(() => cars, [cars]);

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      // Filter: DefaultColumnFilter,
      minWidth: 30,
      width: 120,
      maxWidth: 800,
    }),
    []
  );

  const initialState = {
    sortBy: [
      {
        id: 'name',
        asc: true,
      },
    ],
    hiddenColumns: columns
      .filter((col) => col.isVisible === false)
      .map((col) => col.accessor),
    pageSize: 20,
  };

  const filterTypes = React.useMemo(
    () => ({
      // Override the default text filter to use
      // "startWith"
      text: (rows, ids, filterValue) => {
        rows = rows.filter((row) =>
          ids.some((id) => {
            const rowValue = row.values[id];
            const arrayFilter = String(filterValue).split(' ');

            return arrayFilter.reduce((res, cur) => {
              // res -> response; cur -> currency (atual)
              res =
                res &&
                String(rowValue)
                  .toLowerCase()
                  .includes(String(cur).toLowerCase());
              return res;
            }, true);
          })
        );
        return rows;
      },
    }),
    []
  );

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <span className="fw-bold">Especificação:</span>
        {row.original.obs}
      </>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <Row className="mb-2">
          <Col>
            {' '}
            <Badge>DEMAIS INFORMAÇÕES SOBRE O VEÍCULO</Badge>
          </Col>
        </Row>
        <Row>
          <Col>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={[
                {
                  // Make an expander cell
                  Header: ({
                    getToggleAllRowsExpandedProps,
                    isAllRowsExpanded,
                  }) => (
                    <span {...getToggleAllRowsExpandedProps()}>
                      {isAllRowsExpanded ? '▽' : '▷'}
                    </span>
                  ),
                  id: 'expander', // It needs an ID
                  width: 30,
                  disableResizing: true,
                  Cell: ({ row }) => (
                    // Use Cell to render an expander for each row.
                    // We can use the getToggleRowExpandedProps prop-getter
                    // to build the expander.
                    <span {...row.getToggleRowExpandedProps()}>
                      {row.isExpanded ? '▽' : '▷'}
                    </span>
                  ),
                },
                {
                  Header: 'Cor',
                  accessor: 'color',
                  width: 120,
                  disableResizing: true,
                  disableSortBy: true,
                  filter: 'rangeDate',
                },
                {
                  Header: 'Renavan',
                  accessor: 'renavan',
                },
                {
                  Header: 'Ano',
                  accessor: 'year',
                },
                {
                  Header: 'Chassi',
                  accessor: 'chassi',
                },
                {
                  Header: 'Combustível',
                  accessor: 'CarFueltypeId',
                },
              ]}
              data={[row.original]}
              defaultColumn={{
                // Let's set up our default Filter UI
                // Filter: DefaultColumnFilter,
                minWidth: 30,
                width: 50,
                maxWidth: 800,
              }}
              initialState={{
                // sortBy: [
                //   {
                //     id: 'name',
                //     asc: true,
                //   },
                // ],
                hiddenColumns: [
                  ...columns
                    .filter((col) => col.isVisible === false)
                    .map((col) => col.id),
                  ...columns
                    .filter((col) => col.isVisible === false)
                    .map((col) => col.accessor),
                ],
              }}
              filterTypes={filterTypes}
              renderRowSubComponent={renderRowSubSubComponent}
            />
          </Col>
        </Row>
        {row.original.length ? (
          <>
            <br />
            <Row>
              <Col className="text-center">
                <span className="text-center fw-bold">FOTOS</span>
              </Col>
            </Row>
            <TableNestedrow
              style={{ padding: 0, margin: 0 }}
              columns={[
                {
                  Header: 'Retorno em:',
                  accessor: 'createdAtBr',
                  width: 160,
                  disableResizing: true,
                },
                {
                  Header: 'Valor',
                  accessor: 'valueBr',
                  width: 120,
                  disableResizing: true,
                },
              ]}
              data={[row.original]}
              defaultColumn={{
                // Let's set up our default Filter UI
                // Filter: DefaultColumnFilter,
                minWidth: 30,
                width: 50,
                maxWidth: 800,
              }}
              initialState={{
                sortBy: [
                  {
                    id: 'name',
                    asc: true,
                  },
                ],
                hiddenColumns: columns
                  .filter((col) => col.isVisible === false)
                  .map((col) => col.accessor),
              }}
              filterTypes={filterTypes}
            />
          </>
        ) : null}
      </>
    ),
    []
  );

  return (
    <>
      {' '}
      {console.log(cars)}
      <Loading isLoading={isLoading} />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Automóveis Cadastrados</Card.Title>
          <Card.Text>Cadastros realizados no sisman.</Card.Text>
        </Row>

        <TableGfilterNestedrow
          columns={columns}
          data={data}
          defaultColumn={defaultColumn}
          initialState={initialState}
          filterTypes={filterTypes}
          renderRowSubComponent={renderRowSubComponent}
        />
      </Container>
    </>
  );
}
