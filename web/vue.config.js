const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : './',
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '充实的大学生活';
      return args;
    });
  },
  devServer: {
    proxy: {},
    /**
     * here to ignore the error of webpack-dev-server
     */
    client: {
      overlay: false
    },

  }
});
