const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    error: error ? (error.message || error) : null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
