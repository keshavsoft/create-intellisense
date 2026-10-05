#!/usr/bin/env node

import path from "node:path";
import packageInfo from "../package.json" with { type: "json" };
import createIntellisense from "../src/index.js";

const usage = `
create-intellisense

Generate strong, automatic TypeScript declarations (index.d.ts) for JSON-driven packages.

Usage:
  npx create-intellisense [target-directory] [options]

Examples:
  npx create-intellisense
  npx create-intellisense ./my-package
  npx create-intellisense . -o ./types/index.d.ts

Options:
  -o, --output     Specify output .d.ts filepath (default: ./index.d.ts)
  -h, --help       Show this help message
  -v, --version    Show version (${packageInfo.version})
`;

const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help")) {
    console.log(usage.trim());
    process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
    console.log(packageInfo.version);
    process.exit(0);
}

let outputFile = null;
const outputIndex = args.findIndex((arg) => arg === "-o" || arg === "--output");
if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputFile = args[outputIndex + 1];
}

const targetArg = args.find((arg, index) => {
    return !arg.startsWith("-") && (index === 0 || (args[index - 1] !== "-o" && args[index - 1] !== "--output"));
}) || ".";

const resolvedTarget = path.resolve(process.cwd(), targetArg);

try {
    const { version, routesCount, outputFile: writtenFile } = createIntellisense({
        inProjectRoot: resolvedTarget,
        inOutFile: outputFile
    });

    const displayOut = path.relative(process.cwd(), writtenFile) || writtenFile;

    console.log(`
=============================================================
  ⚡ create-intellisense (v${packageInfo.version})
  Automatic IntelliSense Generator for JSON-Driven Architecture
=============================================================

✨ Successfully generated TypeScript declarations!
📦 Active Version Scanned: src/${version}
🧭 Total Routes Inferred:  ${routesCount}
📝 Output Declaration:     ${displayOut}

💡 Your IDE now has instant autocomplete, parameter hints, and types!
=============================================================
`);
} catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
}
