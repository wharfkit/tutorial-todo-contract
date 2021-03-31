// env vars to forward to snowpack (included in js bundle)
const forwardEnv = ['BRANCH', 'REV', 'NODE_URL', 'CHAIN_ID', 'CONTRACT_ACCOUNT']
for (const key of forwardEnv) {
    process.env[`SNOWPACK_PUBLIC_${key}`] = process.env[key]
}

// determine build settings based on what branch we are building
const currentBranch = process.env['BRANCH']
const isProductionBuild = currentBranch === 'deploy'
if (!process.env['NODE_ENV']) {
    process.env['NODE_ENV'] = isProductionBuild ? 'production' : 'development'
}

/** @type { import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {
        public: {url: '/', static: true},
        src: {url: '/dist'},
    },
    alias: {
        '~/': './src',
        '@/': './public',
    },
    routes: [{match: 'routes', src: '.*', dest: '/index.html'}],
    buildOptions: {
        sourcemap: !isProductionBuild,
    },
    plugins: [
        [
            '@snowpack/plugin-webpack',
            {
                sourceMap: !isProductionBuild,
                htmlMinifierOptions: isProductionBuild ? undefined : false,
            },
        ],
        '@snowpack/plugin-svelte',
        '@snowpack/plugin-typescript',
    ],
    packageOptions: {
        packageLookupFields: ['svelte'],
        packageExportLookupFields: ['svelte'],
    },
}
