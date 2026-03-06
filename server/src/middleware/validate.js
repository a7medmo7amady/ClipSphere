const AppError = require("../utils/AppError");

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Validation error", 400, parsed.error.issues));
    }
    req.body = parsed.data;
    return next();
  };
}

module.exports = {
  validateBody,
};

