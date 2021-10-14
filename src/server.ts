import { path, streams } from "./deps.ts";
import { Status, STATUS_TEXT } from "./http_status.ts";
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
        ename: error.name,
        emessage: error.message,
      });
    }
  }
}

/**
 * function used to serve static frontend
 *
 * will always attempt to stream the file to the user
 * @param request to consume
 * @param ops options to customize the behavior
 * @param log optional logger for insights
 * @returns a response to the request
 */
export async function serveFrontend(
  request: Request,
  ops: ServeFrontendOptions,
  log?: Logger,
) {
  const url = new URL(request.url);
  const headers: HeadersInit = {};
  const ifModifiedSince = new Date(
    request.headers.get("if-modified-since") ?? 0,
  );
  let path = ops.frontendPath + url.pathname;
  let response = new Response(null, {
    status: Status.NotFound,
    statusText: STATUS_TEXT.get(Status.NotFound),
  });
  let file: Deno.File | undefined;
  let fstat: Deno.FileInfo | undefined;
  if (path.endsWith("/")) path += "index.html";
  log?.debug("new http request", { url, method: request.method, path });
  try {
    [file, fstat] = await Promise.all([
      Deno.open(path, READ_ONLY),
      Deno.stat(path),
    ]);
    if (!wasFileModifiedSince(fstat, ifModifiedSince)) {
      response = new Response(null, {
        status: Status.NotModified,
        statusText: STATUS_TEXT.get(Status.NotModified),
      });
    } else if (fstat.isFile) {
      headers["content-type"] = contentType(path);
      if (fstat.mtime) headers["last-modified"] = fstat.mtime.toUTCString();
      response = new Response(streams.readableStreamFromReader(file), {
        status: Status.OK,
        statusText: STATUS_TEXT.get(Status.OK),
        headers,
      });
      file = undefined;
    }
  } catch (error) {
    log?.error("serving frontend file failed", {
      ename: error.name,
      emessage: error.message,
    });
  } finally {
    file?.close();
  }
  return response;
}

/**
 * check whether file was modified since the date provided
 * @param fstat file stats
 * @param ifModifiedSince date to check against
 * @returns true if file is newer, else false
 */
function wasFileModifiedSince(
  fstat: Deno.FileInfo,
  ifModifiedSince: Date,
): boolean {
  return fstat.mtime ? ifModifiedSince < fstat.mtime : true;
}

/**
 * converts the filepath to appropriate content type header
 * @param filepath string representation of file path
 * @returns content type header matching the file
 */
function contentType(filepath: string) {
  return MEDIA_TYPES[path.extname(filepath)] ?? "application/octet-stream";
}

/**
 * open options indicating to open file in readonly mode
 */
const READ_ONLY: Readonly<Deno.OpenOptions> = { read: true };
/**
 * a conversion table between mime type and correct content type header
 */
const MEDIA_TYPES: Readonly<Record<string, string>> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".conf": "text/plain",
  ".list": "text/plain",
  ".log": "text/plain",
  ".ini": "text/plain",
  ".vtt": "text/vtt",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".mp3": "audio/mp3",
  ".mp4a": "audio/mp4",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".spx": "audio/ogg",
  ".opus": "audio/ogg",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".aac": "audio/x-aac",
  ".flac": "audio/x-flac",
  ".mp4": "video/mp4",
  ".mp4v": "video/mp4",
  ".mkv": "video/x-matroska",
  ".mov": "video/quicktime",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".tiff": "image/tiff",
  ".psd": "image/vnd.adobe.photoshop",
  ".ico": "image/vnd.microsoft.icon",
  ".webp": "image/webp",
  ".es": "application/ecmascript",
  ".epub": "application/epub+zip",
  ".jar": "application/java-archive",
  ".war": "application/java-archive",
  ".webmanifest": "application/manifest+json",
  ".doc": "application/msword",
  ".dot": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".dotx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  ".cjs": "application/node",
  ".bin": "application/octet-stream",
  ".pkg": "application/octet-stream",
  ".dump": "application/octet-stream",
  ".exe": "application/octet-stream",
  ".deploy": "application/octet-stream",
  ".img": "application/octet-stream",
  ".msi": "application/octet-stream",
  ".pdf": "application/pdf",
  ".pgp": "application/pgp-encrypted",
  ".asc": "application/pgp-signature",
  ".sig": "application/pgp-signature",
  ".ai": "application/postscript",
  ".eps": "application/postscript",
  ".ps": "application/postscript",
  ".rdf": "application/rdf+xml",
  ".rss": "application/rss+xml",
  ".rtf": "application/rtf",
  ".apk": "application/vnd.android.package-archive",
  ".key": "application/vnd.apple.keynote",
  ".numbers": "application/vnd.apple.keynote",
  ".pages": "application/vnd.apple.pages",
  ".geo": "application/vnd.dynageo",
  ".gdoc": "application/vnd.google-apps.document",
  ".gslides": "application/vnd.google-apps.presentation",
  ".gsheet": "application/vnd.google-apps.spreadsheet",
  ".kml": "application/vnd.google-earth.kml+xml",
  ".mkz": "application/vnd.google-earth.kmz",
  ".icc": "application/vnd.iccprofile",
  ".icm": "application/vnd.iccprofile",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xlm": "application/vnd.ms-excel",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pot": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".potx":
    "application/vnd.openxmlformats-officedocument.presentationml.template",
  ".xps": "application/vnd.ms-xpsdocument",
  ".odc": "application/vnd.oasis.opendocument.chart",
  ".odb": "application/vnd.oasis.opendocument.database",
  ".odf": "application/vnd.oasis.opendocument.formula",
  ".odg": "application/vnd.oasis.opendocument.graphics",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".rar": "application/vnd.rar",
  ".unityweb": "application/vnd.unity",
  ".dmg": "application/x-apple-diskimage",
  ".bz": "application/x-bzip",
  ".crx": "application/x-chrome-extension",
  ".deb": "application/x-debian-package",
  ".php": "application/x-httpd-php",
  ".iso": "application/x-iso9660-image",
  ".sh": "application/x-sh",
  ".sql": "application/x-sql",
  ".srt": "application/x-subrip",
  ".xml": "application/xml",
  ".zip": "application/zip",
};
