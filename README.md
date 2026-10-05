# create-intellisense

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20.10-brightgreen.svg)](package.json)

Zero-dependency automatic TypeScript declaration (`index.d.ts`) generator for **JSON-driven NPM architectures**.

Companion tool to [create-json-driven-npm](https://www.npmjs.com/package/create-json-driven-npm) and [json-driven-npm](https://www.npmjs.com/package/json-driven-npm).

---

## ⚡ Quick Start

Run directly in the root of any JSON-driven repository:

```bash
# Using npx:
npx create-intellisense

# Or specify a target directory:
npx create-intellisense ./my-package

# Or specify a custom output path:
npx create-intellisense . -o ./types/index.d.ts
```

---

## 🧠 How It Works

Instead of copying static `.d.ts` templates or polluting your business repository with generator scripts, `create-intellisense` operates as an **intelligent analyzer**:

1. **Scans**: Discovers the active version in `./src/` (e.g. `src/v6`, `src/v7`).
2. **Reads**: Parses the version's public routes (`external-api/api.json`) and domain specifications (`source.json`).
3. **Infers**: Synthesizes strongly-typed DTO interfaces from transformation rules and maps out the callable API tree.
4. **Writes**: Generates a single, production-grade `index.d.ts` in your project root.

---

## 🛠️ CLI Options

| Option | Alias | Description |
| :--- | :--- | :--- |
| `--output <file>` | `-o` | Custom path to output `.d.ts` (default: `./index.d.ts`) |
| `--help` | `-h` | Show CLI usage instructions |
| `--version` | `-v` | Show package version |

---

## 📦 Programmatic Usage

You can also run it programmatically in build scripts:

```javascript
import createIntellisense from "create-intellisense";

createIntellisense({
    inProjectRoot: process.cwd()
});
```

---

## License

MIT © [KeshavSoft](https://github.com/keshavsoft)
