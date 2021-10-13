DEV_FLAGS = --watch --allow-env --allow-net \
			--allow-read --cached-only

.phony: dev clean deps

dev:
	deno run $(DEV_FLAGS) ./src/main.ts

deps:
	deno cache \
		--lock=lock.json \
		--lock-write \
		./src/deps.ts

clean:
	rm -r ./dist/*