import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down`);
  server.close((error) => {
    if (error) {
      console.error("Error during shutdown", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
