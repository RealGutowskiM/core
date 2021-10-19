ENV_VARS = DENO_DIR=./deno_dir
DEV_FLAGS = --watch \
	--allow-env \
	--allow-net \
	--allow-read \
	--cached-only \
	--config ./deno.jsonc
DEPS_FLAGS = --lock=lock.json \
	--lock-write \
	--config ./deno.jsonc

.phony: dev deps clean

dev:
	$(ENV_VARS) deno run $(DEV_FLAGS) ./src/main.ts

deps:
	$(ENV_VARS) deno cache $(DEPS_FLAGS) ./src/deps.ts

clean:
	rm -r ./dist/*