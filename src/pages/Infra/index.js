import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import Edificio from './Edificio';
import List from './Edificio/List';
import Subdivision from './Edificio/Subdivision';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function InfraRoutes() {
  return (
    <Routes>
      <Route path="Edificio" element={<Edificio />}>
        <Route path="list" element={<List />} />{' '}
        <Route path="Subdivision" element={<Subdivision />} />{' '}
      </Route>
    </Routes>
  );
}
