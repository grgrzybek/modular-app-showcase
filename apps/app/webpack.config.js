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

import path from "node:path"
import { fileURLToPath } from "url"

import CopyPlugin from "copy-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
// import IntrospectionPlugin from "../../plugins/introspection-webpack-plugin/plugin.js"
// import InvestigationPlugin from "../../plugins/investigation-webpack-plugin/plugin.js"

import bodyParser from "body-parser"

const outputPath = path.resolve("dist")

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  // https://webpack.js.org/configuration/devtool/
  devtool: false,
  entry: {
    "main": "./src/index.ts"
  },
  cache: false,
  output: {
    clean: false,
    filename: "static/js/[name].js"
  },
  resolve: {
    extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
    alias: {
      // because this app built with webpack used:
      //  - "../../node_modules/react-router/dist/development/chunk-D4RADZKF.mjs"
      // and @showcase/hawtio-react built with tsup used require("react-router") turned into:
      //  - "../../node_modules/react-router/dist/development/index.js"
      "react-router": path.resolve(__dirname, "../../node_modules/react-router")
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/styles/[name].css"
    }),
    new CopyPlugin({
      patterns: [
        { from: "**/*", to: outputPath, context: "public/" }
      ]
    }),
    // new IntrospectionPlugin({}),
    // new InvestigationPlugin({})
  ],
  optimization: {
    splitChunks: {
      // see https://webpack.js.org/plugins/split-chunks-plugin/#configuration
      chunks: "async",
      // webpack has two cache groups: default (with hint="") and defaultVendors (with hint="vendors")
      // see github.com/webpack/webpack/lib/config/defaults.js - applyOptimizationDefaults()
      cacheGroups: {
        default: {
          reuseExistingChunk: true,
          name: "main",
          idHint: "default",
           priority: -15
        },
        react: {
          reuseExistingChunk: true,
          test: /\/node_modules\/react*/,
          name: "react",
          idHint: "react"
        },
        patternfly: {
          reuseExistingChunk: true,
          test: /\/node_modules\/@patternfly/,
          name: "patternfly",
          idHint: "pf"
        },
        defaultVendors: {
          reuseExistingChunk: true,
          test: /\/node_modules\//,
          name: "other",
          idHint: "other",
          priority: -10
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            // https://swc.rs/docs/configuration/compilation
            // swc-loader does NOT use tsconfig.json (ts-loader does)
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true
              },
              // @swc/types: JscTarget
              target: "esnext"
            }
          }
        }
      },
      {
        test: /\.woff2?$/,
        type: "asset/resource",
        generator: {
          // we could achieve similar result with output.assetModuleFilename
          publicPath: "static/fonts/",
          outputPath: "static/fonts",
          filename: "[name][ext]"
        }
      },
      {
        test: /\.css$/,
        // use: [ { loader: "style-loader", options: { injectType: "singletonStyleTag" } }, "css-loader" ]
        // use: [ "./plugins/debug-loader.js", { loader: "style-loader", options: {} }, "css-loader" ]
        use: [ { loader: "style-loader", options: {} }, "css-loader" ]
        // use: [ MiniCssExtractPlugin.loader, "css-loader" ]
        // use: [ { loader: MiniCssExtractPlugin.loader, options: { publicPath: "static/styles" } }, "css-loader" ]
      }
    ]
  },
  devServer: {
    static: {
      directory: "./public",
      publicPath: "/hawtio"
    },
    port: 3100,
    hot: false,
    liveReload: false,
    // changing to "ws" adds 20+ more modules to webpack-generated bundle
    webSocketServer: false,
    client: {
      overlay: false,
      progress: false,
      reconnect: false,
      logging: "verbose"
    },
    devMiddleware: {
      writeToDisk: true,
      publicPath: "/hawtio"
    },
    setupMiddlewares: (middlewares, server) => {
      server.app.use(bodyParser.json())

      server.app.get("/", (_, res) => res.redirect(`/hawtio/`))
      server.app.get("/hawtio$", (_, res) => res.redirect("/hawtio/"))

      // single, unified "Authentication config" from Hawtio
      server.app.get("/hawtio/auth/config", (_, res) => {
        res.json(authConfig)
      })

      server.app.get("/hawtio/login", (_, res) => res.redirect("/hawtio/"))
      server.app.post("/hawtio/login", (req, res) => {
        const { username, _password } = req.body
        loggedInUser = username
        res.status(202).end()
      })
      server.app.post("/hawtio/logout", (req, res) => {
        loggedInUser = null
        res.status(202).end()
      })
      server.app.get("/hawtio/user", (_, res) => {
        if (loggedInUser) {
          res.status(200).json(loggedInUser)
        } else {
          res.status(200).json(null)
        }
      })

      return middlewares
    }
  }
}

let loggedInUser = null

const authConfig = [
  {
    "method": "basic",
    "realm": "Hawtio Realm"
  },
  {
    "method": "oidc",
    // TODO: more
  },
  {
    "method": "form",
    "url": "/hawtio/auth/login",
    "type": "form",
    "userField": "username",
    "passwordField": "password"
  },
  {
    "method": "form",
    "url": "/hawtio/auth/login",
    "type": "json",
    "userField": "username",
    "passwordField": "password"
  }
]
