ENV_VARS = DENO_DIR=./deno_dir
DEV_FLAGS = --watch --allow-env --allow-net \
			--allow-read --unstable --cached-only

.phony: dev clean deps

dev:
	$(ENV_VARS) deno run $(DEV_FLAGS) ./src/main.ts

deps:
	$(ENV_VARS) deno cache \
		--lock=lock.json \
		--lock-write \
		./src/deps.ts

clean:
	rm -r ./dist/*