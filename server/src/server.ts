import { createServer } from "http";
import config from "./config/env";
import { connectDatabase } from "./config/database";
import createApp from "./app";
import { initSocketIO } from "./config/socket";

async function startServer() {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);
  initSocketIO(httpServer);

  httpServer.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${config.port} in ${config.env} mode`);
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
