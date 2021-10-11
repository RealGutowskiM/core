import { Logger, ServeFrontendOptions, ServerOptions } from "./_types.ts";
import { ConsoleLogger } from "./logger.ts";
import { serveFrontend, startServer } from "./server.ts";

const log: Logger = new ConsoleLogger(
  "server",
  Boolean(Deno.env.get("MODE")),
);
const soptions: ServerOptions = {
  tls: false,
  port: 8080,
  hostname: "::",
  certFile: "dont have",
  keyFile: "dont have",
};
const sfoptions: ServeFrontendOptions = {
  frontendPath: Deno.cwd() + "/www",
};

for await (const conn of startServer(soptions, log)) {
  handleHttp(conn, log);
}

async function handleHttp(conn: Deno.Conn, log?: Logger): Promise<void> {
  try {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) { /* TODO */ }
      else {
        respondWith(serveFrontend(request, sfoptions, log));
      }
    }
  } catch (err) {
    log?.error("handling http request failed", {
      error: { ename: err.name, emessage: err.message },
    });
  }
}
