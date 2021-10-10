import { Logger } from "./_types.ts";

export class ConsoleLogger implements Logger {
  constructor(
    private readonly _context: string,
    private readonly _productionMode = false,
  ) {}

  info(message: string, data?: Record<string, unknown>): void {
    console.info(this.makeLog(message, "info", data));
  }
  error(message: string, data?: Record<string, unknown>): void {
    console.error(this.makeLog(message, "error", data));
  }
  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(this.makeLog(message, "warn", data));
  }
  trace(message: string, data?: Record<string, unknown>): void {
    if (!this._productionMode) {
      console.trace(this.makeLog(message, "trace", data));
    }
  }
  debug(message: string, data?: Record<string, unknown>): void {
    if (!this._productionMode) {
      console.debug(this.makeLog(message, "debug", data));
    }
  }

  private makeLog(
    message: string,
    level: string,
    data?: Record<string, unknown>,
  ) {
    return JSON.stringify({
      "@timestamp": new Date(),
      "@pid": Deno.pid,
      "@level": level,
      "@context": this._context,
      "@message": message,
      "@data": data,
    });
  }
}
