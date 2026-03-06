import config from "./config/env";
import { connectDatabase } from "./config/database";
import createApp from "./app";

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

