import {
  FrontendTypescriptFile,
  Logger,
  ServeFrontendOptions,
} from "./_types.ts";

export async function compileDynamicTypescriptFrontend(
  sfoptions: ServeFrontendOptions,
  log?: Logger,
): Promise<void> {
  if (!sfoptions.dynamicTsFiles) return;
  for await (
    const { filePath, text } of findTypescriptSources(
      sfoptions.frontendPath,
      log,
    )
  ) {
    sfoptions.dynamicTsFiles.set(filePath, text);
  }
}

async function* findTypescriptSources(
  path: string | URL,
  log?: Logger,
): AsyncGenerator<FrontendTypescriptFile> {
  const checked = new Set<string>();
  for await (const entry of readDirRecursively(path)) {
    if (!entry.name.endsWith(".ts")) continue;
    const { files, diagnostics } = await Deno.emit(entry.name);
    for (const [filePath, text] of Object.entries(files)) {
      if (checked.has(filePath)) continue;
      if (diagnostics.length) {
        log?.warn("comiling typescript diag", { diagnostics });
      }
      log?.debug("compiled typescript file", {
        filePath,
        text: text.length > 80 ? `${text.substr(0, 77)}...` : text,
      });
      checked.add(filePath);
      yield { filePath, text };
    }
  }
}

async function* readDirRecursively(
  path: string | URL,
): AsyncGenerator<Deno.DirEntry> {
  for await (const entry of Deno.readDir(path)) {
    if (entry.isFile) {
      entry.name = `${path}/${entry.name}`;
      yield entry;
    } else if (entry.isDirectory) {
      yield* readDirRecursively(`${path}/${entry.name}`);
    }
  }
}
