import moment from 'moment';
import 'moment/locale/pt-br'; // Import the specific locale you want to customize

// Customize the desired localization messages
const customMessages = {
  today: 'Hoje',
  previous: 'Ontem',
  next: 'Amanhã',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Dia todo',
  noEventsInRange: 'No events found',
  showMore: (total) => `+${total} mais`,
};

// Apply the customizations to the moment.js locale
moment.updateLocale('pt-br', customMessages);

export default customMessages;
