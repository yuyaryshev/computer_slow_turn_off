// DOMAIN(ScheduleSerie)
import { array, boolean, constant, Decoder, object, oneOf, optional, string } from "yuyaryshev-json-type-validation";
import { baseDecoderArgs, baseReadObjDecoder, BaseSerialized, baseUpdateDecoderArgs } from "./base";

export type ScheduleSerieId = string;

export interface ScheduleSerieSerialized extends BaseSerialized {
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
    type: "ScheduleSerie";
}

const decoderArgsScheduleSerieSerialized = {
    ...baseDecoderArgs,
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
    type: constant("ScheduleSerie" as "ScheduleSerie"),
};

const decoderArgsScheduleSerieUpdateSerialized = {
    ...baseUpdateDecoderArgs,
    // DOMAIN_FIELDS(Base).Ancestors DOMAIN_FIELDS(ScheduleSerie)
    type: constant("ScheduleSerie" as "ScheduleSerie"),
};
export const decoderScheduleSerieSerialized = object<ScheduleSerieSerialized>(decoderArgsScheduleSerieSerialized);

