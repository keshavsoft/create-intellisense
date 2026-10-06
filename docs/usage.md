# Usage & Integration Guide

This guide covers integrating `create-intellisense` into single repositories, multi-package workspaces, and automated CI pipelines.

---

## 1. Quick Ad-Hoc Execution

To quickly generate or refresh types without installing anything into your repository:

```bash
# In the current project directory
npx create-intellisense

# Target an explicit path
npx create-intellisense ./packages/tally-simple

# Write to a custom path
npx create-intellisense . -o ./dist/types/index.d.ts
```

---

## 2. Standard Repository Integration (Recommended)

To make TypeScript generation part of your package's routine build and verification workflow:

### Step 1: Install as a Dev Dependency

```bash
npm install --save-dev create-intellisense
```

### Step 2: Configure `package.json`

Add `create-intellisense` to your lifecycle and verification scripts:

```json
{
  "name": "my-tally-client",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "types": "./src/index.d.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "import": "./src/index.js",
      "default": "./src/index.js"
    }
  },
  "scripts": {
    "generate:dts": "create-intellisense",
    "test": "node --test test/test.js",
    "verify": "npm run generate:dts && npm test",
    "prepack": "npm run verify",
    "prepublishOnly": "npm run verify"
  },
  "devDependencies": {
    "create-intellisense": "^1.0.0"
  }
}
```

### Why this is powerful:
- **`npm run verify`**: Developers and CI can test both declaration generation and test execution with one command.
- **`prepublishOnly`**: Guarantees that `index.d.ts` is generated from the latest `source.json` and `api.json` before any tarball is pushed to the NPM registry.

---

## 3. Programmatic API

For custom build pipelines (Rollup, Vite, ESBuild, or custom Node.js runner scripts):

```javascript
import createIntellisense from "create-intellisense";

try {
    const report = createIntellisense({
        inProjectRoot: "./packages/my-service",
        inOutFile: null // defaults to package.json "types" path
    });

    console.log(`Successfully generated declarations for version ${report.version}`);
    console.log(`Discovered ${report.routesCount} callable routes`);
    console.log(`Saved to ${report.outputFile}`);
} catch (err) {
    console.error("Declaration generation failed:", err.message);
    process.exit(1);
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `inProjectRoot` | `string` | No | `process.cwd()` | Target repository root directory |
| `inOutFile` | `string` | No | `null` | Optional output file override |

### Return Value

Returns an object with:
- `version` (`string`): The active version directory scanned (e.g., `"v7"`).
- `routesCount` (`number`): Count of public endpoints processed.
- `outputFile` (`string`): Absolute path where `.d.ts` was written.
