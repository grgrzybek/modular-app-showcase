import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  verbose: true,
  transform: {
    "^.*\\.tsx?$": [ "ts-jest", {
      diagnostics: {
        pretty: true
      }
    }]
  }
}

export default config
