import {
    anyJson,
    array,
    boolean,
    constant,
    Decoder,
    dict,
    object,
    oneOf,
    optional,
    string,
    number,
    withDefault,
} from "yuyaryshev-json-type-validation";
import { readFileSync } from "fs";
import { parse } from "json5";

export interface DbSettings {
    recreateSchema?: boolean; // DATA LOSS WARNING! ! If true, drops all tables which matches domain names and creates new ones instead of them.
    createTestData?: boolean; //  If true - creates test data. !ONLY WORKS IF recreateSchema IS ALSO TRUE, else has no effect
    client: "better-sqlite3" | "sqlite3" | "pg" | "mysql" | "mssql" | "oracle";
    version?: string;
    connection: {
        host?: string;
        port?: number;
        user?: string;
        password?: string;
        database?: string;
        filename?: string; // "./mydb.sqlite" | ":memory:" | "file:memDb1?mode=memory&cache=shared"
        searchPath?: string[];
        flags?: string[];
    };
    pool?: {
        min: number;
        max: number;
    };
}
export const decoderDbSettings: Decoder<DbSettings> = object({
    client: oneOf(constant("better-sqlite3"), constant("sqlite3"), constant("pg"), constant("mysql"), constant("mssql"), constant("oracle")),
    version: optional(string()),
    connection: object({
        host: optional(string()),
        port: optional(number()),
        user: optional(string()),
        password: optional(string()),
        database: optional(string()),
        filename: optional(string()),
        searchPath: optional(array(string())),
        flags: optional(array(string())),
    }),
    pool: optional(
        object({
            min: number(),
            max: number(),
        }),
    ),
});

export interface TimersBackendServerSettings {
    db: DbSettings;
    api: {
        port: number;
    };
    authStorage: {
        path: string;
        authStorageDays?: number;
    };
}

export const decoderTimersBackendServerSettings: Decoder<TimersBackendServerSettings> = object({
    db: decoderDbSettings,
    api: object({
        port: number(),
    }),
    authStorage: object({
        path: string(),
        authStorageDays: optional(number()),
    }),
});

export function readServerSettings(pathToSettings: string): TimersBackendServerSettings {
    const settingsStr = readFileSync(pathToSettings || "./settings.json5", "utf-8");
    const parsedSettings = parse(settingsStr);
    decoderTimersBackendServerSettings.runWithException(parsedSettings);
    return parsedSettings;
}

let serverSettings: TimersBackendServerSettings | undefined = undefined;
export function getCachedServerSettings(pathToSettings: string, forceRefresh?: boolean) {
    if (!serverSettings || forceRefresh) {
        serverSettings = readServerSettings(pathToSettings);
    }
    return serverSettings!;
}
