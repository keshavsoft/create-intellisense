import fs from "node:fs";
import path from "node:path";
import findActiveVersion from "../scan/findActiveVersion.js";
import loadVersionDefinition from "../parser/loadVersionDefinition.js";
import renderDeclaration from "../renderer/renderDeclaration.js";

const startFunc = ({ inProjectRoot = process.cwd(), inOutFile = null }) => {
    const localProjectRoot = path.resolve(inProjectRoot);
    const localOutFile = inOutFile;

    const activeVersion = findActiveVersion({
        inProjectRoot: localProjectRoot
    });

    const definition = loadVersionDefinition({
        inVersion: activeVersion
    });

    const declaration = renderDeclaration({
        inDefinition: definition
    });

    const targetOutFile = localOutFile
        ? path.resolve(localProjectRoot, localOutFile)
        : path.join(localProjectRoot, "index.d.ts");

    fs.writeFileSync(targetOutFile, declaration, "utf8");

    return {
        version: activeVersion.name,
        routesCount: definition.apiPaths.length,
        outputFile: targetOutFile
    };
};

export default startFunc;
