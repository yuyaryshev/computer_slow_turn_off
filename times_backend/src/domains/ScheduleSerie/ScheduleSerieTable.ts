// DOMAIN(ScheduleSerie)
import {BaseRowDefaultFields, BaseRowT, BaseTable, declareBaseColumns, TableDescriptor} from "../Base/BaseTable";
import {Knex} from "knex";

export const ScheduleSerieTableDescriptor: TableDescriptor = {
    tableName: "ScheduleSerie",
    typeName: "ScheduleSerie",
};

export type ScheduleSerieRowDefaultFields = BaseRowDefaultFields;

export interface ScheduleSerieRowT extends BaseRowT {
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
}

export class ScheduleSerieTable extends BaseTable<ScheduleSerieRowT, ScheduleSerieRowDefaultFields> {
    constructor(db: Knex) {
        super(db, ScheduleSerieTableDescriptor);
    }

    async createTable() {
        if (!(await this.knex.schema.hasTable(this.tableDescriptor.tableName))) {
            await this.knex.schema.createTable(this.tableDescriptor.tableName, (t) => {
                // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
                declareBaseColumns(t);
                //t.string("foo");
            });
        }
    }

    upsertTestData() {
        return this.knexTable().insert([
            // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
            { id: "ScheduleSerie:1001", name: "ScheduleSerie1", description: "ScheduleSerie1 long description" },
            { id: "ScheduleSerie:1002", name: "ScheduleSerie2", description: "ScheduleSerie2 long description" },
            { id: "ScheduleSerie:1003", name: "ScheduleSerie3", description: "ScheduleSerie3 long description" },
        ]);
    }
}
