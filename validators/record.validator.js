const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().required(),
  date: Joi.date().iso().optional(),
  description: Joi.string().allow('', null).optional(),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  category: Joi.string().optional(),
  date: Joi.date().iso().optional(),
  description: Joi.string().allow('', null).optional(),
}).min(1);

module.exports = {
  createRecordSchema,
  updateRecordSchema,
};
