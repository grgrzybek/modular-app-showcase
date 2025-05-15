// noinspection JSUnusedGlobalSymbols

import { defineConfig } from "tsup"

export default defineConfig({
  entry: [ "src/index.ts" ],
  target: "esnext",
  dts: true,
  sourcemap: true,
  loader: {
    ".md": "text"
  }
})
