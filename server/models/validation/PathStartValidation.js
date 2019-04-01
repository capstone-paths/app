const Joi = require('joi');

const ValidationError = require('./ValidationError');

const PathStartSchema = {
  id: Joi.string().guid(),
  name: Joi.string().alphanum().min(2).max(30).required()
}

/**
 * Validates whether the start node info is correct
 * @param {Object} pathStartData The data for the starting node 
 */
const validatePathStart = async (pathStartData) => {
  console.log('validatePathStart');
  const schema = Joi.object().keys(PathStartSchema);
  const { error } = await Joi.validate(pathStartData, schema);
  if (error) {
    throw new ValidationError(error.details);
  }
}

module.exports = validatePathStart;