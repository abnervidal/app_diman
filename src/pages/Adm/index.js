import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import Unidade from './Unidade';
import User from './User';
import UserList from './User/List';
import UserAdd from './User/Add';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function MaterialsRoutes() {
  return (
    <Routes>
      <Route path="unidades" element={<Unidade />} />
      <Route path="users" element={<User />}>
        <Route path="list" element={<UserList />} />{' '}
        <Route path="add" element={<UserAdd />} />{' '}
      </Route>
    </Routes>
  );
}
