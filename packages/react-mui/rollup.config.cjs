const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');

module.exports = withNx(
    {
        main: './src/index.ts',
        outputPath: '../../dist/packages/react-mui',
        tsConfig: './tsconfig.lib.json',
        compiler: 'swc',
        external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            /^@mui\//,
            /^@emotion\//,
            'dayjs',
        ],
        format: ['esm'],
        assets: [{ input: '.', output: '.', glob: 'README.md' }],
    },
    {
        plugins: [
            svg({
                svgo: false,
                titleProp: true,
                ref: true,
            }),
            url({
                limit: 10000,
            }),
        ],
    },
);
