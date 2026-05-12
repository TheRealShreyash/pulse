import http from "node:http";
import "dotenv/config";
import { createApplication } from "./app";
import { setupSocketServer } from "./socket";
import { PORT } from "./config";

async function main() {
  try {
    const server = http.createServer(createApplication());
    const io = setupSocketServer(server);

    const port = PORT || 8080;

    server.listen(PORT, () => {
      console.log(`[HTTP] Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(`Error starting the server: `, error);
    process.exit(1);
  }
}

main();
