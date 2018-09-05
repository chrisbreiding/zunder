module.exports = () => ({
  plugins: [
    require.resolve('babel-plugin-add-module-exports'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    [require.resolve('@babel/plugin-proposal-decorators'), {
      legacy: true,
    }],
    [require.resolve('@babel/plugin-proposal-class-properties'), {
      loose: true, // necessary for decorators
    }],
    [require.resolve('@babel/plugin-transform-runtime'), {
      absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package')),
    }],
  ],
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react'),
  ],
})
