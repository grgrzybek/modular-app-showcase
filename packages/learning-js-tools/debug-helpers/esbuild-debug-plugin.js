export default {
    name: 'debug-loader',
    setup(build) {
        console.log('debug-loader setup called')

        build.onLoad({ filter: /\.ts$/ }, async (args) => {
            console.log('cwd:', process.cwd())
            console.log('Loading:', args.path, args.namespace, args.pluginData)
            // return {
            //   contents: `export default () => console.log('debug')`,
            //   resolveDir: args.path.split('/node_modules/')[0]
            // }
            return null
        })

        build.onResolve({ filter: /.*/ }, (args) => {
            console.log('Resolving:', args.path, args.importer)
            // return {
            //   path: args.path,
            //   namespace: 'debug-namespace'
            // }
            return null
        })
    }
}
