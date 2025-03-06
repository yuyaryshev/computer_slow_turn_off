import { ServerEnv } from "../ServerEnv";

// @INPRINT_START {exclude:[]}

// @INPRINT_END


// DOMAIN(ScheduleSerie)
import { ScheduleSerieTable } from "./ScheduleSerie/ScheduleSerieTable";
import { ScheduleSerieDomain } from "./ScheduleSerie/ScheduleSerieDomain";
import { publishScheduleSerieApi } from "./ScheduleSerie/ScheduleSerieApi";

//COMMENTED_ScheduleItem // DOMAIN(ScheduleItem)
//COMMENTED_ScheduleItem import { ScheduleItemTable } from "./schedule_item/ScheduleItemTable";
//COMMENTED_ScheduleItem import { ScheduleItemDomain } from "./schedule_item/ScheduleSerieDomain";
//COMMENTED_ScheduleItem import { publishScheduleItemApi } from "./schedule_item/ScheduleItemApi";

// DOMAIN(Person)
import { PersonTable } from "./Person/PersonTable";
import { PersonDomain } from "./Person/PersonDomain";
import { publishPersonApi } from "./Person/PersonApi";

import { BaseTable } from "./Base/BaseTable";
import { Knex } from "knex";
import { DomainsPrereq } from "./Base/BaseDomain";
import { ApiPrereq } from "./Base/BaseApi";
import { AllObjectsTable } from "./Base/AllObjectsTable";

export const makeTables = (db: Knex) => {
    return {
        ScheduleSerie: new PersonTable(db), // TABLE(ScheduleSerie)
//COMMENTED_ScheduleItem         ScheduleItem: new PersonTable(db), // TABLE(ScheduleItem)
        Person: new PersonTable(db), // TABLE(Person)
    };
};
export type Tables = ReturnType<typeof makeTables>;

export const makeTablesAndViews = (db: Knex, tables: Tables) => {
    return { ...tables, allObjects: new AllObjectsTable(db, tables) };
};
export type TablesAndViews = ReturnType<typeof makeTablesAndViews>;

export const makeDomains = (domainPrereq: DomainsPrereq) => {
    // , env: ServerEnv
    return {
        ScheduleSerie: new ScheduleSerieDomain(domainPrereq), // DOMAIN(ScheduleSerie)
//COMMENTED_ScheduleItem         ScheduleItem: new ScheduleItemDomain(domainPrereq), // DOMAIN(ScheduleItem)
        Person: new PersonDomain(domainPrereq), // DOMAIN(Person)
    };
};
export type Domains = ReturnType<typeof makeDomains>;

export function publishApis(apiPrereq: ApiPrereq) {
    publishScheduleSerieApi(apiPrereq); // DOMAIN(ScheduleSerie)
//COMMENTED_ScheduleItem     publishScheduleItemApi(apiPrereq); // DOMAIN(ScheduleItem)
    publishPersonApi(apiPrereq); // DOMAIN(Person)
}

function __typeChecker001() {
    // Should never be called.
    // Used just to enforce type checks on domains

    const domains = makeDomains(undefined as any);
    // let abstractDomain: AbstractDomain;
    let abstractDomainId: keyof typeof domains = undefined as any;

    // Tests that all domains implement 'AbstractDomain'
    // abstractDomain = domains[abstractDomainId];
}
