// DOMAIN(Person)
import { array, boolean, constant, Decoder, object, oneOf, optional, string } from "yuyaryshev-json-type-validation";
import { baseDecoderArgs, baseReadObjDecoder, BaseSerialized, baseUpdateDecoderArgs } from "./base";

export type PersonId = string;

export interface PersonSerialized extends BaseSerialized {
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
    type: "Person";
}

const decoderArgsPersonSerialized = {
    ...baseDecoderArgs,
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
    type: constant("Person" as "Person"),
};

const decoderArgsPersonUpdateSerialized = {
    ...baseUpdateDecoderArgs,
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(Person)
    type: constant("Person" as "Person"),
};
export const decoderPersonSerialized = object<PersonSerialized>(decoderArgsPersonSerialized);

