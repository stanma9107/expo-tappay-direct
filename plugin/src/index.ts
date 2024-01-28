import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const withAllowBackupFalse: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    console.log("Applying withAllowBackupFalse...");

    if (
      !config.modResults.manifest.application ||
      !Array.isArray(config.modResults.manifest.application)
    ) {
      console.log(
        "Unexpected format in AndroidManifest.xml. Make sure you have an <application> tag.",
      );
      return config;
    }

    for (const application of config.modResults.manifest.application) {
      if (application && application["$"]) {
        application["$"]["android:allowBackup"] = "false";
        console.log("Set android:allowBackup to false.");
      } else {
        console.log("Skipped an application element.");
      }
    }

    return config;
  });
};

module.exports = withAllowBackupFalse;
