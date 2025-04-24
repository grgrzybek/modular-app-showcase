// noinspection JSUnusedGlobalSymbols

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
    compiler.hooks.thisCompilation.tap("IntrospectionPlugin", (compilation, params) => {
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
