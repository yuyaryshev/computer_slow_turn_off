// DOMAIN(ScheduleSerie)
import {ScheduleSerieRowDefaultFields, ScheduleSerieRowT, ScheduleSerieTable} from "./ScheduleSerieTable.js";
import {BaseDomain, BaseObjT, DomainsPrereq} from "../Base/BaseDomain";
import {ExtendedFieldCategoriesObj} from "../../common_types/index.js";
import {ScheduleSerieSerialized} from "../../common_types/ScheduleSerie.js";

// DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
export interface ScheduleSerieObj extends BaseObjT {
    type: "ScheduleSerie";
}

export class ScheduleSerieDomain extends BaseDomain<ScheduleSerieRowT, ScheduleSerieRowDefaultFields, ScheduleSerieObj, ScheduleSerieSerialized, ScheduleSerieTable> {
    public table: ScheduleSerieTable;
    constructor(domainPrereq: DomainsPrereq) {
        super(domainPrereq, { name: "ScheduleSerie", table: domainPrereq.tables.ScheduleSerie });
        this.table = domainPrereq.tables.ScheduleSerie;
    }

    async query(extend: ExtendedFieldCategoriesObj): Promise<ScheduleSerieObj[]> {
        return this.rowsToObjects(await this.table.knexTable().select(), extend);
    }

    serialize(featureObj: ScheduleSerieObj): ScheduleSerieSerialized {
        return featureObj;
    }
}
