import { Logger, ServerOptions } from "./_types.ts";
import { ConsoleLogger } from "./logger.ts";
import { startServer } from "./server.ts";

const log: Logger = new ConsoleLogger("server", Boolean(Deno.env.get("MODE")));
const soptions: ServerOptions = {
  tls: false,
  port: 8080,
  hostname: "::",
  certFile: "dont have",
  keyFile: "dont have",
};

for await (const conn of startServer(soptions, log)) {
  // handle a request
}
