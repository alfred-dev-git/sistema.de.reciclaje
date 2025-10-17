export const validateLogin = (data) => {
  const errors = [];
  if (!data.email) errors.push('Email requerido');
  if (!data.password) errors.push('Password requerido');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
};
