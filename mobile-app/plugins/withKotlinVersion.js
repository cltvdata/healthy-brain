const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins')

module.exports = function withKotlinVersion(config) {
  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /enableBundleCompression/g,
      '// removed: '
    )
    return config
  })

  config = withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /ext\.kotlinVersion\s*=\s*"[\d.]+"/,
      'ext.kotlinVersion = "2.0.0"'
    )
    return config
  })

  return config
}
