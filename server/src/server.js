const config = require("./config/env");
const { connectDatabase } = require("./config/database");
const createApp = require("./app");

async function startServer() {
  await connectDatabase();

  const app = createApp();

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server");
  if (config.env !== "production") {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  process.exit(1);
});

