// DOMAIN(Person)
import {PersonRowDefaultFields, PersonRowT, PersonTable} from "./PersonTable";
import {BaseDomain, BaseObjT, DomainsPrereq} from "../Base/BaseDomain";
import {PersonSerialized} from "../../common_types/Person.js";
import {ExtendedFieldCategoriesObj} from "../../common_types/index.js";

// DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
export interface PersonObj extends BaseObjT {
    type: "Person";
}

export class PersonDomain extends BaseDomain<PersonRowT, PersonRowDefaultFields, PersonObj, PersonSerialized, PersonTable> {
    public table: PersonTable;
    constructor(domainPrereq: DomainsPrereq) {
        super(domainPrereq, { name: "Person", table: domainPrereq.tables.Person });
        this.table = domainPrereq.tables.Person;
    }

    async query(extend: ExtendedFieldCategoriesObj): Promise<PersonObj[]> {
        return this.rowsToObjects(await this.table.knexTable().select(), extend);
    }

    serialize(personObj: PersonObj): PersonSerialized {
        return personObj;
    }
}
