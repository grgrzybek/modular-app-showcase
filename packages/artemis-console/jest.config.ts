import type { JestConfigWithTsJest } from "ts-jest"

/** This is the only place where express.js port is declared - it can be imported wherever it is needed */
const port = 3123

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  // https://jestjs.io/docs/configuration#testenvironment-string
  // custom jsdom to fix errors like "ReferenceError: TextEncoder is not defined"
  testEnvironment: "./jest.jsdom.env.ts",

  verbose: true,
  transform: {
    "^.*\\.tsx?$": [ "ts-jest", {
      diagnostics: {
        pretty: true
      }
    }],
    // // see https://jestjs.io/docs/code-transformation#transforming-images-to-their-path
    // "^.*\\.css$": "<rootDir>/src/__mocks__/fileTransformer.cjs"
  },
  moduleNameMapper: {
    "^.*\\.css$": "<rootDir>/src/__mocks__/fileModule.cjs"
  },
  setupFilesAfterEnv: [ "<rootDir>/src/__testconfig__/setup.ts" ]
}

export default config
export { port }
