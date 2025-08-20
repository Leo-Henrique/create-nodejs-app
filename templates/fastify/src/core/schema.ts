import { ZodType, ZodTypeAny } from "zod";

export type ZodRestrictShape<Target> = {
  [K in keyof Target]: ZodType<Target[K]>;
};

export type ZodRestrictFieldsShape<Target> = {
  [K in keyof Target]: ZodTypeAny;
};

export type ZodUnrestrictShape<Target> = {
  [K in keyof Target | (string & {})]?: K extends keyof Target
    ? ZodType<Target[K]>
    : ZodTypeAny;
};

export type ZodUnrestrictFieldsShape<Target> = {
  [K in keyof Target | (string & {})]?: ZodTypeAny;
};

export type ZodUnrestrictEnumFromLiterals<Target extends string> = [
  Target,
  ...Target[],
];
