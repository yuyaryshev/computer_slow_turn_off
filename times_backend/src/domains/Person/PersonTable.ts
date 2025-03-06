// DOMAIN(Person)
import {BaseRowDefaultFields, BaseRowT, BaseTable, declareBaseColumns, TableDescriptor} from "../Base/BaseTable";
import {Knex} from "knex";

export const personTableDescriptor: TableDescriptor = {
    tableName: "person",
    typeName: "Person",
};

export type PersonRowDefaultFields = BaseRowDefaultFields;

export interface PersonRowT extends BaseRowT {
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
}

export class PersonTable extends BaseTable<PersonRowT, PersonRowDefaultFields> {
    constructor(db: Knex) {
        super(db, personTableDescriptor);
    }

    async createTable() {
        if (!(await this.knex.schema.hasTable(this.tableDescriptor.tableName))) {
            await this.knex.schema.createTable(this.tableDescriptor.tableName, (t) => {
                // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
                declareBaseColumns(t);
                //t.string("foo");
            });
        }
    }

    upsertTestData() {
        return this.knexTable().insert([
            // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
            { id: "Person:1001", name: "person1", description: "person1 long description" },
            { id: "Person:1002", name: "person2", description: "person2 long description" },
            { id: "Person:1003", name: "person3", description: "person3 long description" },
        ]);
    }
}
