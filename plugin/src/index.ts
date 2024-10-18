import {
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withProjectBuildGradle,
} from "expo/config-plugins";

type MergeResults = {
  contents: string;
  didClear: boolean;
  didMerge: boolean;
};

const gradleMaven = `
allprojects {
  repositories {
    flatDir( dirs: "$rootDir/../node_modules/expo-tappay-direct/android/libs" )
  }
}
`;

const appendContents = ({
  src,
  newSrc,
}: {
  src: string;
  newSrc: string;
}): MergeResults => {
  return { contents: src + newSrc, didClear: false, didMerge: false };
};

export function createGeneratedHeaderComment(
  contents: string,
  tag: string,
  comment: string,
): string {
  // Everything after the `${tag} ` is unversioned and can be freely modified without breaking changes.
  return `${comment} @generated begin ${tag} - expo prebuild (DO NOT MODIFY)`;
}

function getGeneratedSectionIndexes(
  src: string,
  tag: string,
): { contents: string[]; start: number; end: number } {
  const contents = src.split("\n");
  const start = contents.findIndex((line) =>
    line.includes(`@generated begin ${tag}`),
  );
  const end = contents.findIndex((line) =>
    line.includes(`@generated end ${tag}`),
  );

  return { contents, start, end };
}

export function removeGeneratedContents(
  src: string,
  tag: string,
): string | null {
  const { contents, start, end } = getGeneratedSectionIndexes(src, tag);
  if (start > -1 && end > -1 && start < end) {
    contents.splice(start, end - start + 1);
    // TODO: We could in theory check that the contents we're removing match the hash used in the header,
    // this would ensure that we don't accidentally remove lines that someone added or removed from the generated section.
    return contents.join("\n");
  }
  return null;
}

function addLines(
  content: string,
  find: string | RegExp,
  offset: number,
  toAdd: string[],
) {
  const lines = content.split("\n");

  let lineIndex = lines.findIndex((line) => line.match(find));
  if (lineIndex < 0) {
    const error = new Error(
      `Failed to match "${find}" in contents:\n${content}`,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    error.code = "ERR_NO_MATCH";
    throw error;
  }
  for (const newLine of toAdd) {
    lines.splice(lineIndex + offset, 0, newLine);
    lineIndex++;
  }

  return lines.join("\n");
}

export function mergeContents({
  src,
  newSrc,
  tag,
  anchor,
  offset,
  comment,
}: {
  src: string;
  newSrc: string;
  tag: string;
  anchor: string | RegExp;
  offset: number;
  comment: string;
}): MergeResults {
  const header = createGeneratedHeaderComment(newSrc, tag, comment);
  if (!src.includes(header)) {
    // Ensure the old generated contents are removed.
    const sanitizedTarget = removeGeneratedContents(src, tag);
    return {
      contents: addLines(sanitizedTarget ?? src, anchor, offset, [
        header,
        ...newSrc.split("\n"),
        `${comment} @generated end ${tag}`,
      ]),
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }
  return { contents: src, didClear: false, didMerge: false };
}

export const disableLint = (src: string): string => {
  return mergeContents({
    tag: `expo-tappay-direct`,
    src,
    newSrc: `lintOptions {
      abortOnError false
      checkReleaseBuilds false
    }`,
    anchor: new RegExp(`^\\s*android\\s*{`),
    offset: 1,
    comment: "//",
  }).contents;
};

const withTappayDirectGradle: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, ({ modResults, ...exportedConfig }) => {
    console.log("Disable lint in app/build.gradle...");
    if (modResults.language !== "groovy") {
      return { modResults, ...exportedConfig };
    }

    modResults.contents = disableLint(modResults.contents);
    return { modResults, ...exportedConfig };
  });
};

const withAllowBackupFalse: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (config) => {
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

  config = withTappayDirectGradle(config);

  return config;
};

module.exports = withAllowBackupFalse;
