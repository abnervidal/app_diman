/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaShare,
  FaDolly,
  FaCheck,
  FaTimes,
  FaInfo,
  FaRegCopy,
} from 'react-icons/fa';

import {
  Container,
  Row,
  Card,
  Col,
  Button,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import axios from '../../../../../services/axios';
import Loading from '../../../../../components/Loading';

// import generic table from material's components with global filter and nested row
import TableGfilterNestedrow from '../../../components/TableGfilterNestedRow';
import TableNestedrow from '../../../components/TableNestedRow';

const renderTooltip = (props, message) => (
  <Tooltip id="button-tooltip" {...props}>
    {message}
  </Tooltip>
);

const handleStoreAsk = (e) => {
  e.preventDefault();
  const check = e.currentTarget.nextSibling;
  const copyIcon = check.nextSibling;
  const times = copyIcon.nextSibling;
  check.className = check.className.replace('d-none', 'd-block');
  copyIcon.className = copyIcon.className.replace('d-none', 'd-block');
  times.className = times.className.replace('d-none', 'd-block');
  console.log(e.currentTarget.className);
  e.currentTarget.className += ' d-none';
  console.log(e.currentTarget.className);
  // e.currentTarget.remove();
};

export default function Index({
  reserves,
  getReservesData,
  userId,
  setInitialValues,
  setOpenCollapse,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateSeparetedAt = async (values) => {
    const { id: materialReserveId } = values;
    const updateSeparation = {
      separatedAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);

      // FAZ A ATUALIZAÇÃO DA SEPARAÇÃO
      await axios.put(
        `/materials/reserve/${materialReserveId}`,
        updateSeparation
      );

      setIsLoading(false);
      getReservesData();

      toast.success(`Separação realizada com sucesso`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const handleStoreFast = async (values) => {
    const updateWithdrawnAt = {
      withdrawnAt: new Date().toISOString(),
    };

    const formattedValues = {
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    delete Object.assign(formattedValues, {
      materialReserveId: formattedValues.id,
    }).id; // id de saída gerado automaticamente, se deixar vai usar o id da reserva
    delete formattedValues.created_at; // mesmo raciocinio acima

    formattedValues.UserId = userId;
    formattedValues.materialOuttypeId = 1; // SAÍDA PARA USO
    formattedValues.MaterialReserveItems.forEach((item) => {
      delete Object.assign(item, { MaterialId: item.materialId }).materialId; // rename key
      item.value = item.value
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9\.]+/g, '');
    });

    Object.assign(formattedValues, {
      MaterialOutItems: formattedValues.MaterialReserveItems,
    }); // rename key

    try {
      setIsLoading(true);

      // ATUALIZAR QUANTIDADES DO INVENTARIO
      for (const item of formattedValues.MaterialReserveItems) {
        const response = await axios.get(
          `/materials/inventory/${item.MaterialId}`
        );
        const { releaseInventory, reserveInventory } = response.data;
        const updateInventory = {
          releaseInventory: Number(releaseInventory) + Number(item.quantity),
          reserveInventory: Number(reserveInventory) - Number(item.quantity),
        };

        await axios.put(
          `/materials/inventory/${item.MaterialId}`,
          updateInventory
        );
      }

      if (!('separatedAt' in formattedValues)) handleUpdateSeparetedAt(values); // SE NAO TIVER SEPARADO JA SEPARA NA SAIDA

      // FAZ A SAÍDA RAPIDA
      await axios.post(`/materials/out/`, formattedValues);

      // ATUALIZA DATA DE SAIDA DA RESERVA
      await axios.put(
        `/materials/reserve/${formattedValues.materialReserveId}`,
        updateWithdrawnAt
      );

      setIsLoading(false);
      getReservesData();

      toast.success(`Saída de reserva realizada com sucesso`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const handleCancelReserve = async (values) => {
    const updateCanceledAt = {
      canceledAt: new Date().toISOString(),
    };

    const formattedValues = {
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    delete Object.assign(formattedValues, {
      materialReserveId: formattedValues.id,
    }).id; // id de saída gerado automaticamente, se deixar vai usar o id da reserva

    formattedValues.MaterialReserveItems.forEach((item) => {
      Object.assign(item, { MaterialId: item.materialId }); // rename key
      item.value = item.value
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^0-9\.]+/g, '');
    });

    try {
      setIsLoading(true);

      // ATUALIZAR QUANTIDADES DO INVENTARIO
      for (const item of formattedValues.MaterialReserveItems) {
        const response = await axios.get(
          `/materials/inventory/${item.MaterialId}`
        );
        const { releaseInventory, reserveInventory } = response.data;
        const updateInventory = {
          releaseInventory: Number(releaseInventory) + Number(item.quantity),
          reserveInventory: Number(reserveInventory) - Number(item.quantity),
        };

        await axios.put(
          `/materials/inventory/${item.MaterialId}`,
          updateInventory
        );
      }

      // ATUALIZA DATA DE CANCELAMENTO DA RESERVA
      await axios.put(
        `/materials/reserve/${formattedValues.materialReserveId}`,
        updateCanceledAt
      );

      setIsLoading(false);
      getReservesData();

      toast.info(`Cancelamento de reserva realizado`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };
  const handleImportReserve = async (values) => {
    const formattedValues = {
      ...Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null)
      ),
    }; // LIMPANDO CHAVES NULL E UNDEFINED

    delete Object.assign(formattedValues, {
      materialReserveId: formattedValues.id,
    }).id; // id de saída gerado automaticamente, se deixar vai usar o id da reserva

    delete formattedValues.created_at;
    delete formattedValues.createdAtBr;
    delete formattedValues.userId;
    delete formattedValues.UserId;

    formattedValues.MaterialReserveItems.forEach((item) => {
      Object.assign(item, { MaterialId: item.materialId }); // rename key
    });

    Object.assign(formattedValues, {
      items: formattedValues.MaterialReserveItems,
    });

    formattedValues.workerId = {
      label: formattedValues.workerName,
      value: formattedValues.workerId,
    };

    formattedValues.authorizedBy = {
      label: formattedValues.authorizerName,
      value: formattedValues.authorizerId,
    };

    console.log(formattedValues);

    try {
      setOpenCollapse(true);
      setInitialValues(formattedValues);

      toast.info(`Reserva importada para formulário`);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        // Make an expander cell
        Header: () => null, // No header
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
        Header: 'Req. Man.',
        accessor: 'reqMaintenance',
        width: 120,
        disableResizing: true,
      },
      {
        Header: 'Previsão',
        accessor: 'intendedUseBr',
        width: 120,
        disableResizing: true,
        disableSortBy: true,
      },
      {
        Header: 'Reserva para',
        accessor: 'workerName',
        disableSortBy: true,
      },
      {
        Header: 'Autorização',
        accessor: 'authorizerUsername',
        width: 180,
        disableResizing: true,
        Cell: (props) => {
          const custom = String(props.value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return <span> {custom}</span>;
        },
        disableSortBy: true,
      },
      {
        Header: 'Reservado por',
        accessor: 'userUsername',
        width: 180,
        disableResizing: true,
        Cell: ({ value, row }) => {
          const custom = String(value).replace(
            /(^[a-z]*)\.([a-z]*).*/gm,
            '$1.$2'
          ); // deixar só os dois primeiros nomes
          return (
            <>
              <div> {custom}</div>
              <div> {row.original.createdAtBr}</div>
            </>
          );
        },
        disableSortBy: true,
      },
      {
        Header: 'Separação',
        accessor: 'separatedAtBr',
        width: 120,
        disableResizing: true,
        Cell: ({ value, row }) => (
          <Row>
            <Col className="p-auto text-center">
              {value ? (
                <span>{value}</span>
              ) : (
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) =>
                    renderTooltip(props, 'Realizar separação')
                  }
                >
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="border-0"
                    onClick={() => {
                      handleUpdateSeparetedAt(row.original);
                    }}
                  >
                    <FaDolly />
                  </Button>
                </OverlayTrigger>
              )}
            </Col>
          </Row>
        ),
        disableSortBy: true,
      },
      {
        Header: 'Valor',
        accessor: 'valueBr',
        width: 120,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        disableSortBy: true,
      },
      {
        Header: 'Local',
        accessor: 'place',
        width: 150,
        disableResizing: true,
        // eslint-disable-next-line react/destructuring-assignment
        disableSortBy: true,
      },
      {
        Header: () => null,
        id: 'withdrawnAtBr',
        width: 40,
        disableResizing: true,
        disableSortBy: true,
        Cell: ({ value, row }) => (
          <Row>
            {' '}
            <Col xs="auto" className="p-auto text-end">
              {row.original.obs ? (
                <>
                  {' '}
                  <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => renderTooltip(props, row.original.obs)}
                  >
                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="border-0 m-0"
                    >
                      <FaInfo />
                    </Button>
                  </OverlayTrigger>
                </>
              ) : null}
            </Col>
            <Col className="p-auto text-end">
              {value}{' '}
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Realizar ação')}
              >
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="border-0"
                  onClick={handleStoreAsk}
                >
                  <FaShare />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Confirmar saída')}
              >
                <Button
                  size="sm"
                  variant="outline-success"
                  className="border-0 d-none"
                  onClick={() => {
                    handleStoreFast(row.original);
                  }}
                >
                  <FaCheck />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) =>
                  renderTooltip(props, 'Importar reserva e cancelar')
                }
              >
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="border-0 mt-2 d-none"
                  onClick={() => {
                    handleImportReserve(row.original);
                    handleCancelReserve(row.original);
                  }}
                >
                  <FaRegCopy />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Cancelar reserva')}
              >
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="border-0 mt-2 d-none"
                  onClick={() => {
                    handleCancelReserve(row.original);
                  }}
                >
                  <FaTimes />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => reserves, [reserves]);

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
    // sortBy: [
    //   {
    //     id: 'req',
    //     desc: true,
    //   },
    // ],
    pageSize: 50,
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

  const renderRowSubSubComponent = React.useCallback(
    ({ row }) => (
      <div>
        <span className="fw-bold">Especificação:</span>{' '}
        {row.original.specification}
      </div>
    ),
    []
  );

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <TableNestedrow
        style={{ padding: 0, margin: 0 }}
        columns={[
          {
            // Make an expander cell
            Header: () => null, // No header
            id: 'expander', // It needs an ID
            width: 30,
            disableResizing: true,
            Cell: ({ row }) => (
              // Use Cell to render an expander for each row.
              // We can use the getToggleRowExpandedProps prop-getter
              // to build the expander.
              <Row>
                <span {...row.getToggleRowExpandedProps()}>
                  {row.isExpanded ? '▽' : '▷'}
                </span>
              </Row>
            ),
          },
          {
            Header: 'ID',
            accessor: 'materialId',
            width: 125,
            disableResizing: true,
            isVisible: window.innerWidth > 768,
          },
          { Header: 'Denominação', accessor: 'name' },
          {
            Header: 'Unidade',
            accessor: 'unit',
            width: 100,
            disableResizing: true,
          },
          {
            Header: 'Qtd',
            accessor: 'quantity',
            width: 100,
            disableResizing: true,
          },
          {
            Header: 'Valor',
            accessor: 'value',
            width: 100,
            disableResizing: true,
            // eslint-disable-next-line react/destructuring-assignment
          },
        ]}
        data={row.original.MaterialReserveItems}
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
        renderRowSubComponent={renderRowSubSubComponent}
      />
    ),
    []
  );

  return (
    <>
      <Loading isLoading={isLoading} />

      <TableGfilterNestedrow
        columns={columns}
        data={data}
        defaultColumn={defaultColumn}
        initialState={initialState}
        filterTypes={filterTypes}
        renderRowSubComponent={renderRowSubComponent}
      />
    </>
  );
}
