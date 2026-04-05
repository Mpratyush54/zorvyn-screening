const { errorResponse } = require('../utils/response');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((err) => err.message);
      return errorResponse(res, 'Validation error', 400, details);
    }
    next();
  };
};

module.exports = { validateRequest };
