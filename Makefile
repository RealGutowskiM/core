DEV_FLAGS = --watch --allow-env --allow-net

.phony: dev clean

dev:
	deno run $(DEV_FLAGS) ./src/main.ts

clean:
	rm -r ./dist/*