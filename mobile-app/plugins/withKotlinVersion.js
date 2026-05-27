const {
  withProjectBuildGradle,
  withDangerousMod,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

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

  config = withDangerousMod(config, [
    'android',
    (config) => {
      const appBuildGradle = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'build.gradle'
      )

      if (fs.existsSync(appBuildGradle)) {
        let content = fs.readFileSync(appBuildGradle, 'utf-8')
        content = content.replace(/enableBundleCompression/g, '// removed: ')
        fs.writeFileSync(appBuildGradle, content)
      }

      return config
    },
  ])

  return config
}

module.exports = withKotlinVersion
