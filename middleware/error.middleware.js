const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // Handle common database errors (Postgres)
  if (err.code === '23505') { // Unique constraint violation
    return errorResponse(res, 'Resources already exists', 409);
  }

  return errorResponse(res, 'Internal Server Error', 500, err);
};

module.exports = errorHandler;
