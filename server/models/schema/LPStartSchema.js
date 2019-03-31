/**
 * LPStartSchema
 * A schema for Learning Path Start nodes.
 */
const Joi = require('joi');

const LPStartSchema = {
  id: Joi.string().guid(),
  name: Joi.string().alphanum().min(2).max(30).required()
}

const schema = Joi.object().keys(LPStartSchema);

module.exports = schema;


