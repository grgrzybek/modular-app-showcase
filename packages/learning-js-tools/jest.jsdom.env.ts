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

import JSDOMEnvironment from "jest-environment-jsdom"

import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';

import { port } from "./jest.config"

class JSDOMEnvironmentEx extends JSDOMEnvironment {

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context)
  }

  async setup(): Promise<void> {
    await super.setup();

    // making fetch() use base URL
    const originalFetch = global.fetch
    this.global.fetch = async (req, options?: RequestInit): Promise<Response> => {
      if (typeof req === "string") {
        if (!req.startsWith("http:")) {
          if (!req.startsWith("/")) {
            req = "/" + req
          }
          req = `http://localhost:${port}/hawtio` + req
        }
      } else if (req instanceof URL) {
        req = new URL(`http://localhost:${port}/hawtio`, req)
      }
      return originalFetch(req, options)
    }
  }
}

export default JSDOMEnvironmentEx
