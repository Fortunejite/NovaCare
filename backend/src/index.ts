import config from './config';
import { startApp } from './app';

if (!config.isValid) {
  console.error("Invalid configuration. Exiting...");
  process.exit(1);
}

startApp();

process.on("SIGINT", async () => {
  console.log("Shutting down application...");
  process.exit(0);
});