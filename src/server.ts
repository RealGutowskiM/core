import { Logger, ServeFrontendOptions, ServerOptions } from "./_types.ts";

/**
 * async generator that will start a server and yield connections as
 * fast as they happen
 *
 * this generator will never stop. Upon connection or server failure,
 * it will attempt to start itself back up again forever
 * @param ops server options used to configure things like port or ip
 * @param log optional logger for insights
 */
export async function* startServer(
  ops: ServerOptions,
  log?: Logger,
): AsyncGenerator<Deno.Conn, never> {
  while (true) {
    log?.info(`starting ${ops.tls ? "tls" : "tcp"} server`, {
      options: ops,
    });
    try {
      for await (
        const conn of ops.tls ? Deno.listenTls(ops) : Deno.listen(ops)
      ) {
        log?.debug("new connection", {
          rid: conn.rid,
          laddress: conn.localAddr,
          raddress: conn.remoteAddr,
        });
        yield conn;
      }
    } catch (error) {
      log?.error("connection error occured", {
        errorName: error.name,
        errorMessage: error.message,
      });
    }
  }
}

export async function serveFrontend(
  request: Request,
  ops: ServeFrontendOptions,
  log?: Logger,
) {
  const url = new URL(request.url);
  let path = ops.frontendPath + url.pathname;
  if (path.endsWith("/")) path += "index.html";
  log?.debug("new http request", { url, method: request.method, path });
  const fileContent = await Deno.readTextFile(path);
  return new Response(fileContent, { status: 200 });
}
