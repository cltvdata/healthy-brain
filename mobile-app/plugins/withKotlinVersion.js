/**
 * Custom Expo config plugin that forces Kotlin 2.0.20 in the generated build.gradle.
 * This is needed because expo-modules-core requires KSP, which only supports Kotlin 2.0+,
 * but the default Expo SDK 54 / React Native 0.76 ships with Kotlin 1.9.25.
 */
const { withProjectBuildGradle } = require('@expo/config-plugins');

const KOTLIN_VERSION = '2.0.20';

const withKotlinVersion = (config) => {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // 1. Add ext.kotlinVersion at the top of the buildscript block
    if (!contents.includes('ext.kotlinVersion')) {
      contents = contents.replace(
        /buildscript\s*\{/,
        `buildscript {\n    ext.kotlinVersion = "${KOTLIN_VERSION}"`
      );
    }

    // 2. Replace the version-less Kotlin gradle plugin classpath with an explicit version
    contents = contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}')`
    );

    // 3. Also handle double-quote variant just in case
    contents = contents.replace(
      'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")',
      `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}")`
    );

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withKotlinVersion;
