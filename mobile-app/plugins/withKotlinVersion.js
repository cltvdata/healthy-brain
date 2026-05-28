const { withAppBuildGradle } = require('@expo/config-plugins')

const withFixEnableBundleCompression = (config) => {
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents
    contents = contents.replace(/enableBundleCompression/g, '// removed: ')
    config.modResults.contents = contents
    return config
  })

  return config
}

module.exports = withFixEnableBundleCompression
