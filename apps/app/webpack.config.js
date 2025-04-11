// noinspection JSUnusedGlobalSymbols

import path from "node:path"
import CopyPlugin from "copy-webpack-plugin"

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
    clean: false,
    filename: "static/js/[name].js"
  },
  resolve: {
    extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "**/*", to: outputPath, context: "public/" }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "async",
      // webpack has two default cache groups
      // see github.com/webpack/webpack/lib/config/defaults.js - applyOptimizationDefaults()
      cacheGroups: {
        default: {
          // name: "mAin",
          idHint: "ddd",
          priority: -200
        },
        defaultVendors: {
          idHint: "vvv",
          test: /\/node_modules\//,
          priority: -100
        },
        bla: {
          idHint: "react",
          test: /\/node_modules\/react/,
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
        use: [ "style-loader", "css-loader" ]
      }
    ]
  },
  devServer: {
    static: "./public",
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
      writeToDisk: true
    }
  }
}
