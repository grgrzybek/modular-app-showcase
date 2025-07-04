/*
 * Copyright 2025 Grzegorz Grzybek
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { JestConfigWithTsJest } from "ts-jest"

/** This is the only place where express.js port is declared - it can be imported wherever it is needed */
const port = 3123

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  // https://jestjs.io/docs/configuration#testenvironment-string
  // custom jsdom to fix errors like "ReferenceError: TextEncoder is not defined"
  // testEnvironment: "./jest.jsdom.env.ts",

  verbose: true,
  transform: {},
  // transform: {
  //   "^.*\\.tsx?$": [ "ts-jest", {
  //     diagnostics: {
  //       pretty: true
  //     }
  //   }]
  // },

  setupFilesAfterEnv: [ "<rootDir>/src/__testconfig__/setup.ts" ],

  testEnvironmentOptions: {
    globalsCleanup: 'on'
  }
}

export default config
export { port }
