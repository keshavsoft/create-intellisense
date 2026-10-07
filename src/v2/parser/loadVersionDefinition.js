import fs from "node:fs";
import path from "node:path";

const getByPath = ({ inObject, inPathString }) => {
    const localObject = inObject;
    const localPathString = inPathString;

    return localPathString.split(".").reduce(
        (current, key) => current?.[key],
        localObject
    );
};

const startFunc = ({ inVersion }) => {
    const localVersion = inVersion;
    let apiFile = path.join(localVersion.directory, "api.json");
    if (!fs.existsSync(apiFile)) {
        apiFile = path.join(localVersion.directory, "external-api", "api.json");
    }

    let sourceFile = path.join(localVersion.directory, "source.json");
    if (!fs.existsSync(sourceFile)) {
        sourceFile = path.join(localVersion.directory, "internal-working", "source.json");
    }

    if (!fs.existsSync(apiFile) || !fs.existsSync(sourceFile)) {
        const indexFile = path.join(localVersion.directory, "index.js");
        if (fs.existsSync(indexFile)) {
            const indexContent = fs.readFileSync(indexFile, "utf8");
            const specMatches = [...indexContent.matchAll(/from\s+["']([^"']+)["']/g)];
            for (const match of specMatches) {
                const specPkg = match[1];
                if (!specPkg.startsWith(".")) {
                    const pkgDir = path.resolve(localVersion.directory, "..", "..", "node_modules", specPkg);
                    const candidateApi = path.join(pkgDir, "api.json");
                    const candidateSource = path.join(pkgDir, "source.json");
                    if (fs.existsSync(candidateApi) && fs.existsSync(candidateSource)) {
                        if (!fs.existsSync(apiFile)) apiFile = candidateApi;
                        if (!fs.existsSync(sourceFile)) sourceFile = candidateSource;
                        break;
                    }
                }
            }
        }
    }

    if (!fs.existsSync(apiFile)) {
        throw new Error(`Missing api.json in ${localVersion.directory}`);
    }

    if (!fs.existsSync(sourceFile)) {
        throw new Error(`Missing source.json in ${localVersion.directory}`);
    }

    const apiPaths = JSON.parse(fs.readFileSync(apiFile, "utf8"));
    const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

    if (!Array.isArray(apiPaths) || apiPaths.length === 0) {
        throw new Error(`API definition in ${apiFile} must contain at least one path.`);
    }

    const tree = {};

    for (const apiPath of apiPaths) {
        if (typeof apiPath !== "string" || !apiPath.trim()) {
            continue;
        }

        const endpoint = getByPath({ inObject: source, inPathString: apiPath }) || {};
        const parts = apiPath.split(".");
        let current = tree;

        parts.forEach((part, index) => {
            current[part] ??= {};

            if (index === parts.length - 1) {
                current[part].__endpoint = true;
                current[part].__action = endpoint.action ?? part;
                current[part].__resultKey = endpoint.resultKey ?? "";
                current[part].__transformation = endpoint.transformation ?? null;
                current[part].__description = endpoint.description ?? `Runs ${apiPath}.`;
            }

            current = current[part];
        });
    }

    const rootName = Object.keys(tree)[0] || "app";

    return {
        version: localVersion,
        apiFile,
        sourceFile,
        apiPaths,
        rootName,
        tree,
        source
    };
};

export default startFunc;
