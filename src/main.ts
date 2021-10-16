import { Logger, ServeFrontendOptions, ServerOptions } from "./_types.ts";
import { FRONTEND_PATH, IS_IN_PRODUCTION_MODE } from "./_constants.ts";
import { ConsoleLogger } from "./logger.ts";
import { serveFrontend, startServer } from "./server.ts";
import { findTypescriptSources } from "./typescript_compiler.ts";

const log: Logger = new ConsoleLogger(
  "server",
  IS_IN_PRODUCTION_MODE,
);
const soptions: ServerOptions = {
  tls: false,
  port: 8080,
  hostname: "::",
  certFile: "dont have",
  keyFile: "dont have",
};
const sfoptions: ServeFrontendOptions = {
  frontendPath: FRONTEND_PATH,
};

for await (const result of findTypescriptSources(sfoptions.frontendPath)) {
  console.log(result);
}

for await (const conn of startServer(soptions, log)) {
  handleHttp(conn, log);
}

async function handleHttp(conn: Deno.Conn, log?: Logger): Promise<void> {
  try {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) { /* TODO */ }
      else {
        respondWith(serveFrontend(request, sfoptions, log)).catch((err) =>
          log?.error("http respond failed", {
            ename: err.name,
            emessage: err.message,
          })
        );
      }
    }
  } catch (err) {
    log?.error("handling http request failed", {
      ename: err.name,
      emessage: err.message,
    });
  }
}
