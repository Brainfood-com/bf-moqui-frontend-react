module.exports = function(api) {
  api.cache(true)
  const plugins = [
    "@babel/plugin-proposal-class-properties",
    [ "@babel/plugin-transform-runtime", {
      corejs: {version: 3, proposals: true},
      helpers: true,
      regenerator: true,
      useESModules: false,
    } ],
  ]
  const presets = [
    [ "@babel/preset-env", {
      modules: false,
      useBuiltIns: "usage",
      corejs: {version: 3, proposals: true},
    } ],
    "@babel/preset-react",
  ]
  return {plugins, presets}
}
