import { ZodType, ZodTypeAny } from "zod";

export type ZodRestrictShape<Target> = {
  [K in keyof Target]: ZodType<Target[K]>;
};

export type ZodRestrictFieldsShape<Target> = {
  [K in keyof Target]: ZodTypeAny;
};

export type ZodUnrestrictShape<Target> = {
  [K in keyof Target]?: ZodType<Target[K]>;
};

export type ZodUnrestrictFieldsShape<Target> = {
  [K in keyof Target]?: ZodTypeAny;
};
