const mongoSanitize = require("express-mongo-sanitize");

// Security middleware bundle.
// Currently focused on NoSQL injection mitigation via express-mongo-sanitize.
function applySecurityMiddlewares(app) {
  // Prevent MongoDB operator injection in req.body, req.query, and req.params.
  app.use(
    mongoSanitize({
      onSanitize: ({ key }) => {
        // Optionally log or track sanitized keys here
        // eslint-disable-next-line no-console
        console.warn(`Sanitized potentially malicious key: ${key}`);
      },
    })
  );
}

module.exports = applySecurityMiddlewares;

