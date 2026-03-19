function maskPhoneInput(value) {
  const onlyNumbers = value.replace(/\D/g, '');

  if (onlyNumbers.length === 0) {
    return '';
  }
  if (onlyNumbers.length <= 2) {
    return `(${onlyNumbers}`;
  }
  if (onlyNumbers.length <= 6) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
  }
  if (onlyNumbers.length <= 10) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 6)}-${onlyNumbers.slice(6, 10)}`;
  }
  return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
}

export { maskPhoneInput };
