/**
 * minimal interface needed for a logger
 */
export type Logger = {
  info(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  trace(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
};

/**
 * server options used to start a server
 */
export type ServerOptions =
  & { tls: boolean }
  & Deno.ListenOptions
  & Deno.ListenTlsOptions;

/**
 * minimal interface for writing HTTP request handlers
 */
export type HttpRequestHandler = (
  request: Request,
  log?: Logger,
) => Response | Promise<Response>;

/**
 * options used to customize frontend server function
 */
export type ServeFrontendOptions = {
  frontendPath: string;
};
