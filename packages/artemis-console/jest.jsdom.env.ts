// noinspection JSUnusedGlobalSymbols

import JSDOMEnvironment from "jest-environment-jsdom"

import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import type { Config } from '@jest/types'

import { port } from "./jest.config"

class JSDOMEnvironmentEx extends JSDOMEnvironment {
  private globalConfig: Config.GlobalConfig
  private projectConfig: Config.ProjectConfig
  private context: EnvironmentContext

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context)
    this.globalConfig = config.globalConfig
    this.projectConfig = config.projectConfig
    this.context = context;
  }

  async setup(): Promise<void> {
    // https://jestjs.io/docs/configuration#testenvironment-string
    // You can also pass variables from this module to your test suites by assigning them to this.global object
    // – this will make them available in your test suites as global variables.
    await super.setup();

    // remember - `this.global !== global`.
    // "global" is our global and "this.global" is the global that will be available in tests

    // See https://github.com/jsdom/jsdom/issues/2524#issuecomment-902027138
    // the below is needed when I do:
    //     import { setGlobalOrigin } from "undici"
    // which effectively means that we're "using" node in web (jsdom) environment
    // this.global.TextEncoder = TextEncoder
    // this.global.TextDecoder = TextDecoder
    // this.global.ReadableStream = ReadableStream
    // this.global.MessagePort = MessagePort

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
