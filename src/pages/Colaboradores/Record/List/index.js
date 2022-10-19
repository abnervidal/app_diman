/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Container, Row, Card } from 'react-bootstrap';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedrow from '../../../Materials/components/TableGfilterNestedRow';

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    async function getWorkers() {
      try {
        setIsLoading(true);
        const response = await axios.get(`/workers`);
        console.log(response.data);
        setWorkers(response.data);

        const employees = {
          colab: [],
        };

        for (const i in response.data) {
          const item = response.data[i];
          var contato = '';

          item.WorkerContacts.map((item) => {
            if (item.default && item.contacttypeId == 2) {
              contato = item.contact;
            }
          });
          employees.colab.push({
            name: item.name,
            cpf: item.cpf,
            birthdate: item.birthdate,
            email: item.email,
            contact: contato,
          });
        }

        console.log(employees);

        setData(employees);

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-unused-expressions
        err.response?.data?.errors
          ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
          : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)
        setIsLoading(false);
      }
    }

    getWorkers();
  }, []);

  const columns = React.useMemo(
    () => [
      { Header: 'Nome', accessor: 'name' },
      { Header: 'CPF', accessor: 'cpf' },
      { Header: 'Data de Nascimento', accessor: 'birthdate' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Contato', accessor: 'contact' },
    ],
    []
  );

  // const employees = {
  //   colab: [],
  // };

  // for (const i in workers.workers) {
  //   const item = workers.workers[i];
  //   var contato = '';

  //   item.WorkersContact.map((item) => {
  //     if (item.default && item.contacttypeId == 1) {
  //       contato = item.contact;
  //     }
  //   });
  //   employees.colab.push({
  //     name: item.name,
  //     cpf: item.cpf,
  //     birthdate: item.birthdate,
  //     email: item.email,
  //     contact: contato,
  //   });
  // }

  // const datasetFormated = [...employees.colab];
  // console.log(datasetFormated);
  // const data = React.useMemo(() => datasetFormated, []);

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

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </>
    ),
    []
  );

  return (
    <>
      <Loading isLoading={isLoading} />
      <Container>
        <Row className="text-center py-3">
          <Card.Title>Colaboradores Cadastrados</Card.Title>
        </Row>

        <TableGfilterNestedrow
          columns={columns}
          data={workers}
          defaultColumn={defaultColumn}
          initialState={initialState}
          filterTypes={filterTypes}
          renderRowSubComponent={renderRowSubComponent}
        />
      </Container>
    </>
  );
}
