import { Knex } from "knex";
import { BaseId, BaseRowT, TableDescriptor } from "./BaseTable";
import { Tables } from "../index";

export const allObjectsTableDescriptor: TableDescriptor = {
    tableName: "all_objects",
    typeName: undefined,
};

export type AllObjectsRowT = BaseRowT;
export type RowDefaultFieldsT = BaseRowT;

export class AllObjectsTable {
    public readonly knex: Knex<AllObjectsRowT>;
    public readonly tableDescriptor: TableDescriptor;
    private tables: Tables;

    constructor(knex: Knex, tables: Tables) {
        this.tableDescriptor = allObjectsTableDescriptor;
        this.knex = knex;
        this.tables = tables;
    }

    knexTable() {
        return this.knex<AllObjectsRowT>(this.tableDescriptor.tableName);
    }

    async getById(id: BaseId): Promise<AllObjectsRowT | undefined> {
        return await (this.knexTable().select().from(this.tableDescriptor.tableName).limit(1).where("id", id)).first();
    }

    // updateById(obj: AllObjectsRowT) {
    //     return this.knexTable()
    //         .where("id", obj.id)
    //         .limit(1)
    //         .update(obj as any);
    // }
    //
    // deleteById(idOrObj: BaseId | AllObjectsRowT) {
    //     const id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
    //     return this.knexTable().where("id", id).limit(1).del();
    // }

    async createTable() {
        // DOMAIN_FIELDS(Base).Core
        const viewColumns = ["type", "id", "name", "description"];

        const viewParts: any[] = [];
        const tableKeys = Object.keys(this.tables) as (keyof Tables)[];
        for (const tableKey of tableKeys) {
            const table = this.tables[tableKey];
            const { tableDescriptor } = table;
            const { tableName, typeName } = tableDescriptor;
            if (!typeName) {
                continue;
            }

            const existingColumns: string[] = [];
            for (const columnName of viewColumns) {
                if (await this.knex.schema.hasColumn(tableName, columnName)) {
                    existingColumns.push(columnName);
                }
            }

            if (existingColumns.includes("id")) {
                const partColumns = [
                    viewColumns.map((colName) => {
                        if (colName === "type") {
                            return this.knex.raw(`'${typeName}' as type`);
                        }
                        return existingColumns.includes(colName) ? colName : this.knex.raw(`NULL as ${colName}`);
                    }),
                ];
                const viewPart = this.knex(table.tableDescriptor.tableName).select(...partColumns); //.where("age", ">", "18");
                viewParts.push(viewPart);
            }
        }

        return this.knex.schema.createViewOrReplace(this.tableDescriptor.tableName, (view) => {
            view.columns(viewColumns);
            view.as(this.knex.unionAll(viewParts));
        });
    }

    upsertTestData() {}

    dropTable() {
        return this.knex.schema.dropViewIfExists(this.tableDescriptor.tableName);
    }
}

// DOMAIN_FIELDS(Base).Core
export type BaseRowDefaultFields = "id" | "description";
