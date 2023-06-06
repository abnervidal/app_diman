import React from 'react';
import { Route, Routes } from 'react-router-dom';

import usersRoletypes from '../../assets/JSON/data/usersRoletypes.json';

import Frequency from './Frequency';
import FacialRecognition from './Frequency/FacialRecognition';
import FrequencyManual from './Frequency/Manual';

import Safety from './Safety';
import RiskAdd from './Safety/Risk/Add';
import RiskList from './Safety/Risk/List';
import EPI from './Safety/EPI';

import Reports from './Reports';
import Active from './Reports/Active';
import Effective from './Reports/Effective';
import HourBank from './Reports/HourBank';
import RegisterFrequency from './Reports/Frequency';
import Absence from './Reports/Absence';
import AbsenceDate from './Reports/AbsenceDate';

import Record from './Record';
import List from './Record/List';
import Add from './Record/Add';

const roles = usersRoletypes.reduce(
  (acc, cur) => ({ ...acc, [cur.role]: cur.id }),
  {}
);

export default function MaterialsRoutes() {
  return (
    <Routes>
      <Route path="frequency" element={<Frequency />}>
        <Route path="facialrecognition" element={<FacialRecognition />} />{' '}
        <Route path="manual" element={<FrequencyManual />} />{' '}
      </Route>

      <Route path="safety" element={<Safety />}>
        <Route path="risk/add" element={<RiskAdd />} />{' '}
        <Route path="risk/list" element={<RiskList />} />{' '}
        <Route path="epi" element={<EPI />} />{' '}
      </Route>

      <Route path="reports" element={<Reports />}>
        <Route path="active" element={<Active />} />{' '}
        <Route path="absence" element={<Absence />} />{' '}
        <Route path="absence_date" element={<AbsenceDate />} />{' '}
        <Route path="effective" element={<Effective />} />{' '}
        <Route path="hourbank" element={<HourBank />} />{' '}
        <Route path="frequency" element={<RegisterFrequency />} />{' '}
      </Route>

      <Route path="record" element={<Record />}>
        <Route path="list" element={<List />} />{' '}
        <Route path="add" element={<Add />} />{' '}
        <Route path="update/:id" element={<Add />} />{' '}
      </Route>
    </Routes>
  );
}
