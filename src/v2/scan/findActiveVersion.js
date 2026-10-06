import fs from "node:fs";
import path from "node:path";

const versionPattern = /^v(\d+)$/;

const readRuntimeVersion = ({ inEntryFile }) => {
    const localEntryFile = inEntryFile;

    if (!fs.existsSync(localEntryFile)) {
        return null;
    }

    const source = fs.readFileSync(localEntryFile, "utf8");
    const match = source.match(/from\s+["']\.\/(v\d+)\/index\.js["']/);

    return match ? match[1] : null;
};

const startFunc = ({ inProjectRoot }) => {
    const localProjectRoot = inProjectRoot;
    const srcDirectory = path.join(localProjectRoot, "src");

    if (!fs.existsSync(srcDirectory)) {
        throw new Error(`Directory not found: ${srcDirectory}`);
    }

    const versions = fs.readdirSync(srcDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && versionPattern.test(entry.name))
        .map((entry) => ({
            name: entry.name,
            number: Number(entry.name.slice(1))
        }))
        .sort((left, right) => right.number - left.number);

    if (versions.length === 0) {
        throw new Error(`No version directories (e.g. v1, v2) found in ${srcDirectory}`);
    }

    const entryFile = path.join(srcDirectory, "index.js");
    const runtimeVersion = readRuntimeVersion({ inEntryFile: entryFile });

    const activeVersionName = runtimeVersion && versions.some((v) => v.name === runtimeVersion)
        ? runtimeVersion
        : versions[0].name;

    const activeVersion = versions.find((v) => v.name === activeVersionName) || versions[0];

    return {
        name: activeVersion.name,
        number: activeVersion.number,
        directory: path.join(srcDirectory, activeVersion.name),
        srcDirectory
    };
};

export default startFunc;
