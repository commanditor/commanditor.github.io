const path = require('path');
const webpack = require('webpack');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env) => ({
	mode: 'development',
	entry: {
		"app": './src/index.js',
		"editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
		"json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
		"css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
		"html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
		"ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker',
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [ 'style-loader', 'css-loader' ]
		},
		{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env']
				}
			}
		}]
	},
	plugins: [
		new webpack.NormalModuleReplacementPlugin(/(.*).ENV_TARGET(\.*)/, resource => resource.request = resource.request.replace(/.ENV_TARGET/, `.${env}`))
		// webpack uglyfies already, and  uglyfyjs breaks build-prod
		//new UglifyJSPlugin()
	],
});
