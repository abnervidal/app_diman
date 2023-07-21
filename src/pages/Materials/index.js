import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import RequireAuth from '../../routes/RequireAuth';
import Unauthorized from '../../components/Unauthorized';

import In from './in';
import Sipac from './in/Sipac';
import InDonation from './in/Donation';
import Returned from './in/Returned';
import First from './in/First';
import Supplier from './in/Supplier';

import Out from './out';
import Use from './out/Use';
import OutDonation from './out/Donation';
import Devolution from './out/Devolution';
import Loss from './out/Loss';
import Discard from './out/Discard';
import Loan from './out/Loan';

import Internal from './internal';
import Restrict from './internal/Restrict';
import InitialQuantity from './internal/InitialQuantity';
import Reserve from './internal/Reserve';
import ListReserves from './internal/ListReserves/ListReserves';
import Transformation from './internal/Transformation';

import Reports from './Reports';
import Input from './Reports/Input';
import Output from './Reports/Output';
import Inventory from './Reports/Inventory';
import MaintenanceBalanceOutput from './Reports/MaintenanceBalanceOutput';
import ConsumeFrequency from './Reports/ConsumeFrequency';
import ProvisionFrequency from './Reports/ProvisionFrequency';
import WorkerByMaterial from './Reports/WorkerByMaterial';
import MaterialByWorker from './Reports/MaterialByWorker';

import Record from './Record';
import List from './Record/List';
import Add from './Record/Add';
import Remove from './Record/Remove';

import Definitions from './definitions';
import Terminology from './definitions/Terminology';
import ProccessFlow from './definitions/ProccessFlow';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function MaterialsRoutes() {
  return (
    <Routes>
      <Route path="/Unauthorized" element={<Unauthorized />} />
      {/* we want to protect these routes */}
      <Route
        element={
          <RequireAuth
            allowedRoles={[
              roles.adm,
              roles.adm_materials,
              roles.super_materials,
            ]}
          />
        }
      >
        <Route path="in" element={<In />}>
          <Route path="sipac" element={<Sipac />} />{' '}
          <Route path="donation" element={<InDonation />} />{' '}
          <Route path="returned" element={<Returned />} />{' '}
          <Route path="first" element={<First />} />{' '}
          <Route path="supplier" element={<Supplier />} />{' '}
        </Route>

        <Route path="out" element={<Out />}>
          <Route path="use" element={<Use />} />{' '}
          <Route path="donation" element={<OutDonation />} />{' '}
          <Route path="devolution" element={<Devolution />} />{' '}
          <Route path="discard" element={<Discard />} />{' '}
          <Route path="loss" element={<Loss />} />{' '}
          <Route path="loan" element={<Loan />} />{' '}
        </Route>

        <Route path="internal" element={<Internal />}>
          <Route path="restrict" element={<Restrict />} />{' '}
          <Route path="initialquantity" element={<InitialQuantity />} />{' '}
          <Route path="transformation" element={<Transformation />} />{' '}
        </Route>
      </Route>

      <Route path="internal" element={<Internal />}>
        <Route path="reserve" element={<Reserve />} />{' '}
        <Route path="listreserves" element={<ListReserves />} />{' '}
      </Route>

      <Route path="reports" element={<Reports />}>
        <Route
          path="maintenancebalanceoutput"
          element={<MaintenanceBalanceOutput />}
        />{' '}
        <Route path="provisionfrequency" element={<ProvisionFrequency />} />{' '}
        <Route path="consumefrequency" element={<ConsumeFrequency />} />{' '}
        <Route path="inventory" element={<Inventory />} />{' '}
        <Route path="Input" element={<Input />} />{' '}
        <Route path="output" element={<Output />} />{' '}
        <Route path="workerbymaterial" element={<WorkerByMaterial />} />{' '}
        <Route path="materialbyworker" element={<MaterialByWorker />} />{' '}
      </Route>

      <Route path="record" element={<Record />}>
        <Route path="list" element={<List />} />{' '}
        <Route path="add" element={<Add />} />{' '}
        <Route path="remove" element={<Remove />} />{' '}
      </Route>

      <Route path="definitions" element={<Definitions />}>
        <Route path="terminology" element={<Terminology />} />{' '}
        <Route path="proccessflow" element={<ProccessFlow />} />{' '}
      </Route>
    </Routes>
  );
}
