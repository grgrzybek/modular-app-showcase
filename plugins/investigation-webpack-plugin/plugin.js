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

class InvestigationPlugin {
  constructor(properties = {}) {
  }
  apply(compiler) {

    compiler.hooks.thisCompilation.tap("InvestigationPlugin", (compilation, _params) => {
      compilation.hooks.moduleIds.tap("InvestigationPlugin", (modules) => {
        console.info("grgr", "modules:", modules.size)
      })
      compilation.hooks.afterChunks.tap("InvestigationPlugin", (chunks) => {
        // The afterChunks hook is invoked following the creation of the chunks and module graph, and prior to their
        // optimization. This hook provides an opportunity to examine, analyze, and modify the chunk graph if necessary.
        for (const c of chunks) {
          console.info("grgr", "[before optimization] c:", c.name)
        }
      })
      compilation.hooks.afterOptimizeChunks.tap("InvestigationPlugin", (chunks) => {
        // Fired after chunk optimization has completed.
        for (const c of chunks) {
          console.info("grgr", "[after optimization] c:", c.name)
        }
      })
      // compilation.hooks.afterOptimizeModules.tap("InvestigationPlugin", (modules) => {
      //   // Called after modules optimization has completed.
      //   for (const c of modules) {
      //     console.info("grgr", "[after optimization] m:", c.name)
      //   }
      // })
      compilation.hooks.addEntry.tap("InvestigationPlugin", (e) => {
        console.info("grgr", "addEntry", e.type, typeof e)
      })
      // compilation.hooks.moduleAsset.tap("InvestigationPlugin", (module, filename) => {
      //   console.info("grgr/module asset", filename)
      // })
      // compilation.hooks.succeedModule.tap("InvestigationPlugin", (module) => {
      //   console.info("grgr/build module", module.resource)
      // })
      compilation.hooks.chunkAsset.tap("InvestigationPlugin", (chunk, filename) => {
        console.info("grgr/chunk", filename)
      })
    })
  }
}

module.exports = InvestigationPlugin
