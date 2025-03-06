import { anyJson, array, constant, Decoder, object, oneOf, optional, string } from "yuyaryshev-json-type-validation";

export interface ObjectWithIdSerialized {
    id: string;
}

export interface RelationItemSerialized {
    id: string;
    relType: string;
    target: any;
}

export const decoderRelationItemSerialized: Decoder<RelationItemSerialized> = object({
    id: string(),
    relType: string(),
    target: anyJson(),
});

export interface BaseUpdateSerialized {
    // DOMAIN_FIELDS(Base).Core
    id: string;
    type: string;
}

export interface BaseFieldSerialized {
    // DOMAIN_FIELDS(Base).Core
    id: string;
    type: string;
    name: string;
    description?: string | undefined;
}

export const baseFieldsDecoderArgs = {
    // DOMAIN_FIELDS(Base).Core
    id: string(),
    type: string(),
    name: string(),
    description: optional(string()),
};

export const baseUpdateFieldsDecoderArgs = {
    // DOMAIN_FIELDS(Base).Core
    id: string(),
    type: string(),
    name: optional(string()),
    description: optional(string()),
};

export type LabelData = BaseFieldSerialized;

export interface BaseSerialized extends BaseFieldSerialized {
    labels?: LabelData[] | undefined;
    relationsFrom?: RelationItemSerialized[] | undefined;
    relationsTo?: RelationItemSerialized[] | undefined;
}

export const decoderObjectWithBaseFields: Decoder<LabelData> = object(baseFieldsDecoderArgs);

export const baseUpdateDecoderArgs = {
    ...baseUpdateFieldsDecoderArgs,
};

export const baseDecoderArgs = {
    ...baseFieldsDecoderArgs,
    // DOMAIN_FIELDS(Base).Core
    labels: optional(array(decoderObjectWithBaseFields)),
    relationsFrom: optional(array(decoderRelationItemSerialized)),
    relationsTo: optional(array(decoderRelationItemSerialized)),
};

export interface ExtendedFieldCategoriesObj {
    relations?: true;
    labels?: true;
}

export type ExtendedFieldCategory = keyof ExtendedFieldCategoriesObj;
export const allExtendedFieldCategories: ExtendedFieldCategory[] = ["relations", "labels"];
export const decoderExtendedFieldCategory: Decoder<ExtendedFieldCategory> = oneOf(...allExtendedFieldCategories.map(constant)) as any;

export type ExtendedFieldCategories = ExtendedFieldCategory[];
export const decoderExtendedFieldCategories: Decoder<ExtendedFieldCategories> = array(decoderExtendedFieldCategory);

export const baseReadObjDecoder = {
    extend: optional(decoderExtendedFieldCategories),
};

export const extendedFieldCategoriesToObj = (extendCategories: ExtendedFieldCategories | undefined): ExtendedFieldCategoriesObj => {
    const r: ExtendedFieldCategoriesObj = {};
    if (extendCategories) {
        for (const k of extendCategories) {
            r[k] = true;
        }
    }
    return r;
};
