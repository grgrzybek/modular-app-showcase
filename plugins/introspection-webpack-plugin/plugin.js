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

class IntrospectionPlugin {
  constructor(properties = {}) {
  }
  apply(compiler) {
    // interceptor for all compiler hooks
    for (const h in compiler.hooks) {
      console.debug("grgr", "registering interceptor for", "compiler.hooks." + h)
      compiler.hooks[h].intercept({
        register: (tapInfo) => {
          console.info("grgr.intercept[compiler.hooks." + h + "]", `${tapInfo.name}`)
          return tapInfo
        }
      })
    }

    // tapping into thisCompilation allows us to access hooks for compilation object
    compiler.hooks.thisCompilation.tap("IntrospectionPlugin", (compilation, _params) => {
      // interceptor for all compilation hooks
      for (const h in compilation.hooks) {
        console.debug("grgr", "registering interceptor for", "compilation.hooks." + h)
          if (h === "additionalChunkAssets" || h === "additionalAssets" || h === "optimizeChunkAssets" || h === "afterOptimizeChunkAssets") {
            // webpack converts it into processAssets - but not if it's intercepted
            continue;
          }
          compilation.hooks[h].intercept({
          register: (tapInfo) => {
            console.info("grgr.intercept[compilation.hooks." + h + "]", `${tapInfo.name}`)
            return tapInfo
          }
        })
      }
    })
  }
}

module.exports = IntrospectionPlugin
