export const IS_IN_PRODUCTION_MODE =
  Deno.env.get("PRODUCTION_MODE")?.toLowerCase() === "yes";

export const FRONTEND_PATH = Deno.env.get("FRONTEND_PATH") ??
  Deno.cwd() + "/www";
