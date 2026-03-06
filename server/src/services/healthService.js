// Example service layer for business logic.
// This is a placeholder to illustrate the three-layer architecture.

function getServiceStatus() {
  return {
    service: "ClipSphere API",
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getServiceStatus,
};

