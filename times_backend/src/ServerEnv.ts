import { EnvWithTimers, ManageableTimer } from "ystd";
import { TimersBackendServerSettings } from "./settings";
import { Domains, TablesAndViews } from "./domains";
import { Knex } from "knex";

export interface ServerEnv extends EnvWithTimers {
    timers: Set<ManageableTimer>;
    getSettings: () => TimersBackendServerSettings;
    knex: Knex;
    tables: TablesAndViews;
    domains: Domains;
}
