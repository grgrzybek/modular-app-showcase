// noinspection JSUnusedGlobalSymbols

import { defineConfig } from "tsup"

export default defineConfig({
  entry: [ "src/index.ts" ],
  target: "esnext",
  splitting: false,
  dts: true,
  sourcemap: true,
  loader: {
    ".md": "text"
  }
})
