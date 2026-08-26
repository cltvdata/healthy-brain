const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins')

module.exports = function withKotlinVersion(config) {
  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /enableBundleCompression/g,
      '// removed: '
    )
    return config
  })

  // Inject kotlinVersion=2.0.0 into gradle.properties
  config = withGradleProperties(config, (config) => {
    const props = config.modResults
    // Remove any existing kotlinVersion entry
    const filtered = props.filter(
      (item) => !(item.type === 'property' && item.key === 'kotlinVersion')
    )
    // Add the correct version
    filtered.push({
      type: 'property',
      key: 'kotlinVersion',
      value: '2.0.0',
    })
    config.modResults = filtered
    return config
  })

  return config
}

