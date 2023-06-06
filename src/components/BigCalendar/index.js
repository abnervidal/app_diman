/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/pt-br';
import { Container } from 'react-bootstrap';
// Customize the desired localization messages
const customMessages = {
  today: 'Hoje',
  previous: 'Ontem',
  next: 'Amanhã',
  month: 'Mês',
  week: 'Semana',
  work_week: 'Semana de trabalho',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Dia todo',
  noEventsInRange: 'No events found',
  showMore: (total) => `+${total} mais`,
};

// // Apply the customizations to the moment.js locale
// moment.updateLocale('pt-br', customMessages);

moment.tz.setDefault('America/Sao_Paulo');

const mLocalizer = momentLocalizer(moment);

console.log('moment', moment);
console.log('localizer', mLocalizer);

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: 'lightblue',
    },
  });

export default function BigCalendar({ localizer = mLocalizer, ...props }) {
  const { components, defaultDate, min, max, views } = useMemo(
    () => ({
      components: {
        timeSlotWrapper: ColoredDateCellWrapper,
      },
      defaultDate: new Date(2023, 4, 10),
      min: moment().hours(6).minutes(0).toDate(),
      max: moment().hours(20).minutes(0).toDate(),
      views: Object.keys(Views).map((k) => Views[k]),
    }),
    []
  );

  // Example event data
  const events = [
    {
      title: 'Meeting',
      start: new Date(),
      end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    },
  ];

  return (
    <Container>
      <Calendar
        culture="pt-br"
        components={components}
        defaultDate={defaultDate}
        events={events}
        localizer={localizer}
        min={min}
        max={max}
        showMultiDayTimes
        step={60}
        views={views}
        style={{ height: 500 }}
        messages={customMessages}
      />
    </Container>
  );
}
