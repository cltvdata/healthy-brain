const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require('@expo/config-plugins')

const KOTLIN_VERSION = '2.0.20'

const withKotlinVersion = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents

    if (!contents.includes('ext.kotlinVersion')) {
      contents = contents.replace(
        /buildscript\s*\{/,
        `buildscript {\n    ext.kotlinVersion = "${KOTLIN_VERSION}"`
      )
    }

    contents = contents.replace(
      /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"](?:\))?/,
      `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}')`
    )

    config.modResults.contents = contents
    return config
  })

  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents

    contents = contents.replace(/enableBundleCompression/g, '// removed: ')

    config.modResults.contents = contents
    return config
  })

  return config
}

module.exports = withKotlinVersion
