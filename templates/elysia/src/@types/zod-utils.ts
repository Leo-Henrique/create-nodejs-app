import type { ZodType } from "zod";

export type ZodRestrictShape<Target> = {
	[K in keyof Target]: ZodType<Target[K]>;
};

export type ZodRestrictFieldsShape<Target> = {
	[K in keyof Target]: ZodType;
};

export type ZodUnrestrictShape<Target> = {
	[K in keyof Target | (string & {})]?: K extends keyof Target
		? ZodType<Target[K]>
		: ZodType;
};

export type ZodUnrestrictFieldsShape<Target> = {
	[K in keyof Target | (string & {})]?: ZodType;
};

export type ZodUnrestrictEnumFromLiterals<Target extends string> = [
	Target,
	...Target[],
];
