import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import Record from './Record';
import List from './Record/List';
import Add from './Record/Add';

import Ocurrence from './Occurrence';
import ListOccurrence from './Occurrence/List';
import AddOccurrence from './Occurrence/Add';

import Inspection from './Inspection';
import ListInspection from './Inspection/List';
import AddInspection from './Inspection/Add';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function fleetRoutes() {
  return (
    <Routes>
      <Route path="record" element={<Record />}>
        <Route path="list" element={<List />} />{' '}
        <Route path="add" element={<Add />} />{' '}
      </Route>

      <Route path="ocorrencia" element={<Ocurrence />}>
        <Route path="listocorrencia" element={<ListOccurrence />} />{' '}
        <Route path="addocorrencia" element={<AddOccurrence />} />{' '}
      </Route>

      <Route path="inspection" element={<Inspection />}>
        <Route path="listinspection" element={<ListInspection />} />{' '}
        <Route path="addinspection" element={<AddInspection />} />{' '}
      </Route>
    </Routes>
  );
}
