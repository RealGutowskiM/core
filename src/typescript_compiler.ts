export async function* findTypescriptSources(path: string | URL) {
  for await (const entry of readDirRecursively(path)) {
    if (!entry.name.endsWith(".ts")) continue;
    const result = await Deno.emit(entry.name);
    yield result.files;
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
