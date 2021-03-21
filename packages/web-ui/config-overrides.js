const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const rewireWebpackBundleAnalyzer = require('react-app-rewire-webpack-bundle-analyzer')
const rewireUglifyjs = require('react-app-rewire-uglifyjs')

const { useBabelRc, override } = require('customize-cra')

module.exports = function (config, env){
   
    config = override(useBabelRc())(config)

    if(env == 'production'){
        config = rewireUglifyjs(config)
        config = rewireWebpackBundleAnalyzer(config, env, {
            analyzerMode: 'static',
            reportFilename: 'report.html'
        })
    }

    config.resolve.plugins.pop();

    config.resolve.plugins.push(new TsconfigPathsPlugin());

    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    const tsRule = oneOfRule.oneOf.find((rule) => rule.test.toString().includes("ts|tsx"))

    tsRule.include = undefined;
    tsRule.exclude = /node_modules/;

    return config;
}