const IS_CI = require('is-ci');

const merge = require('webpack-merge');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const WriteFilePlugin = require('write-file-webpack-plugin');

const { getStyleLoader } = require('./utils');
const { DEFAULT_HOST, DEMO_PATH, MODULES_PATH, ROOT_PATH } = require('./constants');

const baseConfig = require('./webpack.config');

const entry = Object.assign(baseConfig.entry, {
	'demo-site': `${DEMO_PATH}/app.js`,
	'lumx-theme': `${DEMO_PATH}/scss/lumx.scss`,
});

const plugins = [
    ...baseConfig.plugins,
    new ExtractCssChunks({
        chunkFilename: '[name].css',
        filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
        inject: false,
        template: `${DEMO_PATH}/index.html`,
    }),
];

if (!IS_CI) {
    plugins.push(
        new WebpackNotifierPlugin({
            alwaysNotify: true,
            title: 'LumX - Development',
        }),
    );
}

plugins.push(
	new CopyWebpackPlugin([
		{
			context: `${MODULES_PATH}/`,
			from: `${MODULES_PATH}/**/demo/**/*.html`,
			to: `${DEMO_PATH}/includes/modules`,
			transformPath: (targetPath) => {
                const n = targetPath.lastIndexOf('/demo/');
                console.log(targetPath, `${targetPath.slice(0, n)}${targetPath.slice(n).replace('/demo/', '/')}`);
                return `${targetPath.slice(0, n)}${targetPath.slice(n).replace('/demo/', '/')}`;
            },
            force: true,
		},
    ]),
    new WriteFilePlugin(),
);

module.exports = merge.smartStrategy({
    entry: 'replace',
    'module.rules': 'append',
    plugins: 'replace',
})(baseConfig, {
    entry,

    devServer: {
        compress: true,
		contentBase: [DEMO_PATH, ROOT_PATH],
        disableHostCheck: true,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        historyApiFallback: {
            index: '/',
        },
        host: DEFAULT_HOST,
        hot: true,
		open: true,
		overlay: true,
        // eslint-disable-next-line no-magic-numbers
        port: 4001,
        quiet: true,
	},

    module: {
        rules: getStyleLoader({ mode: 'dev' }),
	},

    plugins,
});
