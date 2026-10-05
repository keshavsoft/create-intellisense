import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import createIntellisense from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempProjectDir = path.join(__dirname, "temp-test-project");

const createMockProject = () => {
    const v1Dir = path.join(tempProjectDir, "src", "v1");
    fs.mkdirSync(path.join(v1Dir, "external-api"), { recursive: true });

    fs.writeFileSync(
        path.join(tempProjectDir, "src", "index.js"),
        'export { default } from "./v1/index.js";\n'
    );
    fs.writeFileSync(
        path.join(v1Dir, "index.js"),
        'export { default } from "./external-api/api.js";\n'
    );
    fs.writeFileSync(
        path.join(v1Dir, "external-api", "api.js"),
        'export default {};\n'
    );
    fs.writeFileSync(
        path.join(v1Dir, "external-api", "api.json"),
        JSON.stringify(["app.users.profile", "app.reports.summary"], null, 2)
    );
    fs.writeFileSync(
        path.join(v1Dir, "source.json"),
        JSON.stringify({
            app: {
                users: {
                    profile: {
                        action: "getProfile",
                        resultKey: "UserProfile",
                        transformation: {
                            UserProfile: {
                                transform: {
                                    id: { alterKey: "UserId" },
                                    name: { alterKey: "UserName" }
                                }
                            }
                        }
                    }
                },
                reports: {
                    summary: {
                        action: "getSummary"
                    }
                }
            }
        }, null, 2)
    );
};

test("generates declaration file from JSON-driven project specification", (t) => {
    createMockProject();

    t.after(() => {
        if (fs.existsSync(tempProjectDir)) {
            fs.rmSync(tempProjectDir, { recursive: true, force: true });
        }
    });

    const result = createIntellisense({
        inProjectRoot: tempProjectDir
    });

    assert.equal(result.version, "v1");
    assert.equal(result.routesCount, 2);
    assert.ok(fs.existsSync(result.outputFile));

    const content = fs.readFileSync(result.outputFile, "utf8");
    assert.ok(content.includes("export type AppApi"));
    assert.ok(content.includes("UserProfileDto"));
    assert.ok(content.includes("UserId?: string;"));
    assert.ok(content.includes("UserName?: string;"));
    assert.ok(content.includes("export default app;"));
});
