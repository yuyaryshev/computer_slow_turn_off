import { ServerEnv } from "../../ServerEnv";
import { Knex } from "knex";
import { Condition, Opts } from "./WorkAround";

export type BaseId = string;
export interface TableDescriptor {
    typeName?: string;
    tableName: string;
}

export interface RowWithIdT extends Record<string, string | number | boolean | undefined> {
    id: string;
}

export interface BaseRowT extends Record<string, string | number | boolean | undefined>, RowWithIdT {
    // DOMAIN_FIELDS(Base).Core
    name: string;
    description: string | undefined;
}

export const declareIdColumn = (t: any) => {
    t.string("id").primary();
};

export const declareBaseColumns = (t: any) => {
    declareIdColumn(t);
    t.string("name", 200);
    t.text("description");
};

export class BaseTable<RowT extends RowWithIdT, RowDefaultFieldsT extends keyof RowT> {
    public readonly knex: Knex<RowT>;
    public readonly tableDescriptor: TableDescriptor;

    constructor(knex: Knex, tableDescriptor: TableDescriptor) {
        this.tableDescriptor = tableDescriptor;
        this.knex = knex;
    }

    knexTable() {
        return this.knex<RowT>(this.tableDescriptor.tableName);
    }

    async getById(id: BaseId): Promise<RowT | undefined> {
        return await this.knexTable().select().from(this.tableDescriptor.tableName).limit(1).where("id", id).first();
    }

    updateById(obj: RowT) {
        return this.knexTable()
            .where("id", obj.id)
            .limit(1)
            .update(obj as any);
    }

    deleteById(idOrObj: BaseId | RowT) {
        const id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
        return this.knexTable().where("id", id).limit(1).del();
    }

    createTable() {
        throw new Error(
            `CODE00000000 Internal error. Create not specified for '${this.tableDescriptor.tableName}' table. Use the following as guidline:\n` +
                `
    async createTable() {
        if (!(await this.knex.schema.hasTable(this.tableDescriptor.tableName))) {
            await this.knex.schema.createTable(this.tableDescriptor.tableName, (t) => {
                // DOMAIN_${"FIELDS"}(Base).Ancestors DOMAIN_${"FIELDS"}(???)
                declareBaseColumns(t);
                //t.string("foo");
            });
        }
    }
    `,
        );
    }

    dropTable() {
        return this.knex.schema.dropTableIfExists(this.tableDescriptor.tableName);
    }
}

// DOMAIN_FIELDS(Base).Core
export type BaseRowDefaultFields = "id" | "description";
