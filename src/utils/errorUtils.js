export const handleError = (error, message) => {
  console.error(message, error);
  alert(`${message}: ${error.message}`);
};
