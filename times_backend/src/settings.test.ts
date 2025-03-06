import { expect } from "chai";
import { readServerSettings } from "./settings";

describe("TimersBackend_settings/settings.test.ts", () => {
    it("settings_example.json5 - should be valid and not empty", async function () {
        const exampleSettings = readServerSettings("./settings_example.json5");
        expect(typeof exampleSettings).to.deep.equal("object");
        expect(Object.keys(exampleSettings).length > 0).to.deep.equal(true);
    });

    it("settings.json5 can't have anything that settings_example.json5 doesn't have", async function () {
        const exampleSettings = readServerSettings("./settings_example.json5");
        const settings = readServerSettings("./settings.json5");

        function utDeepCompareSettings(example: any, current: any, problems: string[] = [], path: string = "") {
            for (const k in current) {
                const innerPath = path + (path.length ? "." : "") + k;
                if (!example.hasOwnProperty(k)) {
                    problems.push(`${innerPath} from current settings.json5 doesn't exist in settings_example.json5`);
                }
                if (typeof current[k] === "object") {
                    utDeepCompareSettings(example[k], current[k], problems, innerPath);
                }
            }
            return problems;
        }

        const r = utDeepCompareSettings(exampleSettings, settings);
        expect(r).to.deep.equal([]);
    });
});
