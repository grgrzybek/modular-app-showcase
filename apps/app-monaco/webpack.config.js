// noinspection JSUnusedGlobalSymbols

import path from "node:path"
import CopyPlugin from "copy-webpack-plugin"
import MonacoEditorWebpackPlugin from "monaco-editor-webpack-plugin"

const outputPath = path.resolve("dist")

export default {
  mode: "development",
  // https://webpack.js.org/configuration/devtool/
  devtool: false,
  entry: {
    "main": "./src/index.ts"
  },
  cache: false,
  output: {
    clean: false
  },
  resolve: {
    extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "**/*", to: outputPath, context: "public/" }
      ]
    }),
    new MonacoEditorWebpackPlugin({})
  ],
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
        test: /\.css$/,
        use: [ "style-loader", "css-loader" ]
      },
      {
        test: /\.ttf$/,
        type: "asset/resource"
      }
    ]
  },
  devServer: {
    static: "./public",
    port: 3200,
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
      writeToDisk: true
    }
  }
}
