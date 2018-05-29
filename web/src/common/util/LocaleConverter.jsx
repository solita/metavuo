const LocaleConverter = (timestamp) => {
  const date = new Date(Date.parse(timestamp));

  const locale = 'fi-FI';

  const dateOptions = {
    timeZone: 'Europe/Helsinki',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  const timeOptions = {
    timeZone: 'Europe/Helsinki',
    hour: '2-digit',
    minute: '2-digit',
  };

  const datestring = date.toLocaleDateString(locale, dateOptions);
  const time = date.toLocaleTimeString(locale, timeOptions);

  return `${datestring} ${time}`;
};

export default LocaleConverter;
