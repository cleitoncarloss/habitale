import { useState } from 'react';

export function useDateInput(initialDate = '') {
  const [dateDisplay, setDateDisplay] = useState(formatDateToDisplay(initialDate));
  const [dateISO, setDateISO] = useState(initialDate);

  function formatDateToDisplay(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatDateToISO(displayStr) {
    if (!displayStr) return '';
    const parts = displayStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) {
      return '';
    }
    return `${year}-${month}-${day}`;
  }

  function maskDateInput(value) {
    const onlyNumbers = value.replace(/\D/g, '');

    if (onlyNumbers.length <= 2) {
      return onlyNumbers;
    }
    if (onlyNumbers.length <= 4) {
      return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
    }
    return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 4)}/${onlyNumbers.slice(4, 8)}`;
  }

  function handleChange(e) {
    const maskedDate = maskDateInput(e.target.value);
    setDateDisplay(maskedDate);

    const isoDate = formatDateToISO(maskedDate);
    if (isoDate) {
      setDateISO(isoDate);
    } else {
      setDateISO('');
    }
  }

  function setDate(isoDate) {
    setDateISO(isoDate);
    setDateDisplay(formatDateToDisplay(isoDate));
  }

  return {
    dateDisplay,
    dateISO,
    handleChange,
    setDate,
  };
}
