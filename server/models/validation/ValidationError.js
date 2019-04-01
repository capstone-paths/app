// TODO: If there are more errors, group them in folder, subclass them, etc.
// TODO: Move this to a constants file if we need to
const VALIDATION_ERROR = "ValidationError";

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = VALIDATION_ERROR;
    this.status = 422;
  }
}

module.exports = ValidationError;
