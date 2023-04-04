import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './RequireAuth';

import usersRoletypes from '../assets/JSON/data/usersRoletypes.json';

import LightBox from '../components/LightBox';
import Aluno from '../pages/Aluno';
import Alunos from '../pages/Alunos';
import Fotos from '../pages/Fotos';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Collaborator from '../pages/Collaborator';
import Materials from '../pages/Materials';
import Equip from '../pages/Equip';
import Eletrica from '../pages/Infra/Eletrica';
import Agua from '../pages/Infra/Agua';
import Esgoto from '../pages/Infra/Esgoto';
import Drenagem from '../pages/Infra/Drenagem';
import Pavimento from '../pages/Infra/Pavimento';
import Page404 from '../pages/Page404';
import Providers from '../pages/Providers';
import Infra from '../pages/Infra';
import Adm from '../pages/Adm';
import Fleet from '../pages/Fleet';
import Unauthorized from '../components/Unauthorized';

import Test from '../pages/Materials/Reports/Output/components/EditModal';

// TRANSFORMANDO O ARRAY userRoletypes PARA UM OBJETO ONDE ROLE É A CHAVE E O CÓDIGO É O VALOR
const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function RoutesPages() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/lightbox" element={<LightBox />} />

      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route exact path="/equip/*" element={<Equip />} />
      <Route exact path="/infra/eletrica/*" element={<Eletrica />} />
      <Route exact path="/infra/agua/*" element={<Agua />} />
      <Route exact path="/infra/esgoto/*" element={<Esgoto />} />
      <Route exact path="/infra/drenagem/*" element={<Drenagem />} />
      <Route exact path="/infra/pavimento/*" element={<Pavimento />} />
      <Route exact path="/providers/*" element={<Providers />} />
      <Route exact path="/infra/*" element={<Infra />} />
      <Route exact path="/adm/*" element={<Adm />} />
      <Route exact path="/fleet/*" element={<Fleet />} />

      <Route path="/Unauthorized" element={<Unauthorized />} />
      {/* we want to protect these routes */}

      <Route
        element={
          <RequireAuth
            allowedRoles={[
              roles.adm,
              roles.adm_workers,
              roles.super_workers,
              roles.common_workers,
            ]}
          />
        }
      >
        <Route exact path="/collaborator/*" element={<Collaborator />} />
      </Route>

      <Route
        element={
          <RequireAuth
            allowedRoles={[
              roles.adm,
              roles.adm_materials,
              roles.super_materials,
              roles.common_materials,
            ]}
          />
        }
      >
        <Route exact path="/materials/*" element={<Materials />} />
      </Route>

      <Route exact path="/test/*" element={<Test />} />

      {/* catch all */}
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}
