import { BaseTable, RowWithIdT } from "./BaseTable";
import { TablesAndViews } from "../index";
import { EnvWithTimers } from "ystd";
import { BaseSerialized, ExtendedFieldCategoriesObj } from "../../common_types";

export interface DomainsPrereq {
    envWithTimers: EnvWithTimers;
    tables: TablesAndViews;
}

export type BaseId = string;
export interface DomainDescriptor<TableT extends BaseTable<any, any>> {
    name: string;
    table: TableT;
}

export interface BaseObjT extends BaseSerialized {}

// DOMAIN_FIELDS(Base).Core
export type BaseObjDefaultFields = "id" | "description";

export function baseObjToRow(obj: any): any {
    const { session, type, t, labels, relationsTo, relationsFrom, ...row } = obj;
    return row;
}

export class BaseDomain<
    RowT extends RowWithIdT,
    RowDefaultFieldsT extends keyof RowT,
    ObjT,
    ObjSerializedT,
    TableT extends BaseTable<RowT, RowDefaultFieldsT>,
> {
    private domainPrereq: DomainsPrereq;
    public readonly domainDescriptor: DomainDescriptor<TableT>;

    constructor(domainPrereq: DomainsPrereq, domainDescriptor: DomainDescriptor<TableT>) {
        this.domainPrereq = domainPrereq;
        this.domainDescriptor = domainDescriptor;
    }

    protected async rowToObj(row: RowT, extend: ExtendedFieldCategoriesObj): Promise<ObjT> {
        const r = { type: this.domainDescriptor.name, ...(row as any) };
        return r;
    }

    protected objToRow(obj: { type: string; id: string } & Partial<ObjT>): RowT {
        return baseObjToRow(obj);
    }

    async rowsToObjects(rows: RowT[], extend: ExtendedFieldCategoriesObj) {
        const r: ObjT[] = [];
        for (const row of rows) {
            r.push(await this.rowToObj(row, extend));
        }
        return r;
    }

    async get(id: BaseId, extend: ExtendedFieldCategoriesObj): Promise<ObjT | undefined> {
        const row = await this.domainDescriptor.table.getById(id);
        if (!row) {
            return undefined;
        }
        return this.rowToObj ? this.rowToObj(row, extend) : (row as any);
    }

    async upsert(obj: { type: string; id: string } & Partial<ObjT>) {
        const newRow = this.objToRow ? this.objToRow(obj) : (obj as any);
        const oldRow = await this.domainDescriptor.table.getById(newRow.id);
        if (!oldRow) {
            return this.domainDescriptor.table.knexTable().insert(newRow);
        }
        const { id, ...columnsToUpdate } = newRow;
        return this.domainDescriptor.table
            .knexTable()
            .where({ id } as any)
            .update(columnsToUpdate);
    }

    delete(id: BaseId) {
        return this.domainDescriptor.table.deleteById(id);
    }

    // async select(condition?: Condition<RowT>, opts?: Opts): Promise<ObjT[]> {
    //     const rows = await this.table.knex().select(condition, opts);
    //     return this.rowsToObjects(rows);
    // }
}
