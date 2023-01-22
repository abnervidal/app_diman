import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import Unidade from './Unidade';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function MaterialsRoutes() {
  return (
    <Routes>
      <Route path="unidades" element={<Unidade />} />
    </Routes>
  );
}
