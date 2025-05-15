// noinspection JSUnusedGlobalSymbols

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
