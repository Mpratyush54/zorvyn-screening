const Joi = require('joi');

const updateUserSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'ANALYST', 'VIEWER'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
});

module.exports = {
  updateUserSchema,
};
