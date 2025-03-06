import { ServerEnv } from "../../ServerEnv";
import { Domains } from "../index";
import { EnvWithTimers } from "ystd";
import type {Router} from "express";

export interface ApiPrereq {
    envWithTimers: EnvWithTimers;
    domains: Domains;
    router: Router;
}

export function baseApi(env: ServerEnv) {
    // implementApi(env.transportServer, statusApiDefinition, () => {
    //     return { ok: true };
    // });
}
