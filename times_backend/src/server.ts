import {getCachedServerSettings, TimersBackendServerSettings} from "./settings";
import {resolve} from "node:path";
import debugjs from "debug";
import {ServerEnv} from "./ServerEnv";
import {makeDomains, makeTables, makeTablesAndViews, publishApis} from "./domains";
import knexLib from "knex";
import {DomainsPrereq} from "./domains/Base/BaseDomain";
import {ApiPrereq} from "./domains/Base/BaseApi";
import {EnvWithTimers} from "ystd";
import express from "express"

const log = debugjs("startServer");

function majorLog(message: string) {
    console.log(message);
    log(message);
}

function majorErrorLog(message: string) {
    console.error(message);
    log(message);
}

export interface ServerOpts extends TimersBackendServerSettings {
}

export async function startEnv(opts?: ServerOpts): Promise<ServerEnv> {
    const envWithTimers: EnvWithTimers = {
        timers: new Set(),
    };

    majorLog(`CODE00000000 Initializing TimersBackend server environment`);
    const settingsPath = resolve("./settings.json5");
    majorLog(`CODE00000000 Trying to read server settings from:${settingsPath}`);
    const getSettings = () => getCachedServerSettings(settingsPath);
    const serverSettings = {...getSettings(), ...(opts || {})};

    log(`CODE00000000 Connecting to database`);

    const knex = knexLib(serverSettings.db);

    try {
        // TODO https://www.npmjs.com/Pkg/sql-template-strings

        // simple query
        const testResults = await knex("test").select<any>();
        console.log(testResults);
    } catch (e: any) {
    }

    const tables = makeTables(knex);

    const tablesAndViews = makeTablesAndViews(knex, tables);
    for (const table of Object.values(tablesAndViews)) {
        if (serverSettings.db.recreateSchema) {
            await table.dropTable();
        }
        await table.createTable();
        if (serverSettings.db.recreateSchema && serverSettings.db.createTestData) {
            await table.upsertTestData();
        }
    }

    const domainPrereq: DomainsPrereq = {
        envWithTimers,
        tables: tablesAndViews,
    };
    const domains = makeDomains(domainPrereq);

    log(`CODE00000000 Initializing auth storage`);
    //const { authStorage } = await makeDevAuthStorage();

    const app = express();
    const router = express.Router();

    const apisPrereq: ApiPrereq = {
        envWithTimers,
        domains,
        router
    };

    publishApis(apisPrereq);

    // Mount the router on an API base path
    app.use("/api", router);

    // Start the server
    app.listen(3000, () => console.log("Server running on port 3000"));

    const env: ServerEnv = Object.assign(envWithTimers, {
        getSettings,
        knex,
        tables: tablesAndViews,
        domains,
    });
    return env;
}

export interface TimersBackendServer {
    close: () => void | Promise<void>;
}

export async function startServer(opts?: ServerOpts): Promise<TimersBackendServer> {
    try {
        const env = await startEnv(opts);

        const serverSettings = env.getSettings();


        function close() {
            if (env.knex) {
                env.knex.destroy();
            }
        }

        const r: TimersBackendServer = {
            close,
        };
        return r;
    } catch (e: any) {
        majorLog(`CODE00000000 Failed to start TimersBackend server because of an error:` + e.message);
        throw e;
    }
}
