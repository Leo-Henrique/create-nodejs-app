import type { OverrideProperties } from "type-fest";
import type {
  $ZodIssueCode,
  $ZodIssueCustom,
  $ZodIssueInvalidElement,
  $ZodIssueInvalidKey,
  $ZodIssueInvalidStringFormat,
  $ZodIssueInvalidType,
  $ZodIssueInvalidUnion,
  $ZodIssueInvalidValue,
  $ZodIssueNotMultipleOf,
  $ZodIssueStringEndsWith,
  $ZodIssueStringIncludes,
  $ZodIssueStringInvalidJWT,
  $ZodIssueStringInvalidRegex,
  $ZodIssueStringStartsWith,
  $ZodIssueTooBig,
  $ZodIssueTooSmall,
  $ZodIssueUnrecognizedKeys,
  $ZodRawIssue,
  $ZodStringFormats,
  $ZodType,
} from "zod/v4/core";

type ZodIssueTooSmallOrTooBigExact = ($ZodIssueTooSmall | $ZodIssueTooBig) & {
  minimum?: number | bigint;
  maximum?: number | bigint;
};

type ZodCustomErrorMapData = {
  required: string | ((issue: $ZodIssueInvalidType) => string);
  types: OverrideProperties<
    Partial<
      Record<
        $ZodType["_zod"]["def"]["type"],
        {
          invalid: string | ((issue: $ZodIssueInvalidType) => string);
        }
      >
    >,
    {
      default: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        too_small: string | ((issue: $ZodIssueTooSmall) => string);
        too_big: string | ((issue: $ZodIssueTooBig) => string);
      };
      string: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        greater_than_or_equal: string | ((issue: $ZodIssueTooSmall) => string);
        less_than_or_equal: string | ((issue: $ZodIssueTooBig) => string);
        exact: string | ((issue: ZodIssueTooSmallOrTooBigExact) => string);
      };
      number: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        greater_than: string | ((issue: $ZodIssueTooSmall) => string);
        greater_than_or_equal: string | ((issue: $ZodIssueTooSmall) => string);
        less_than: string | ((issue: $ZodIssueTooBig) => string);
        less_than_or_equal: string | ((issue: $ZodIssueTooBig) => string);
        not_multiple_of: string | ((issue: $ZodIssueNotMultipleOf) => string);
      };
      date: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        greater_than_or_equal:
          | string
          | ((
              issue: OverrideProperties<$ZodIssueTooSmall, { minimum: Date }>,
            ) => string);
        less_than_or_equal:
          | string
          | ((
              issue: OverrideProperties<$ZodIssueTooBig, { maximum: Date }>,
            ) => string);
      };
      array: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        greater_than: string | ((issue: $ZodIssueTooSmall) => string);
        less_than: string | ((issue: $ZodIssueTooBig) => string);
        exact: string | ((issue: ZodIssueTooSmallOrTooBigExact) => string);
      };
      file: {
        invalid: string | ((issue: $ZodIssueInvalidType) => string);
        greater_than_or_equal: string | ((issue: $ZodIssueTooSmall) => string);
        less_than_or_equal: string | ((issue: $ZodIssueTooBig) => string);
      };
    }
  >;
  formats: OverrideProperties<
    Partial<
      Record<
        $ZodStringFormats,
        string | ((issue: $ZodIssueInvalidStringFormat) => string)
      >
    >,
    {
      regex?: string | ((issue: $ZodIssueStringInvalidRegex) => string);
      jwt?: string | ((issue: $ZodIssueStringInvalidJWT) => string);
      includes?: string | ((issue: $ZodIssueStringIncludes) => string);
      starts_with?: string | ((issue: $ZodIssueStringStartsWith) => string);
      ends_with?: string | ((issue: $ZodIssueStringEndsWith) => string);
    }
  > & {
    default: string | ((issue: $ZodIssueInvalidStringFormat) => string);
  };
  others: {
    custom?: string | ((issue: $ZodIssueCustom) => string);
    invalid_value?: string | ((issue: $ZodIssueInvalidValue) => string);
    invalid_union?: string | ((issue: $ZodIssueInvalidUnion) => string);
    invalid_element?: string | ((issue: $ZodIssueInvalidElement) => string);
    invalid_key?: string | ((issue: $ZodIssueInvalidKey) => string);
    unrecognized_keys?: string | ((issue: $ZodIssueUnrecognizedKeys) => string);
  } & {
    default:
      | string
      | ((
          issue: Exclude<
            $ZodIssueCode,
            | "invalid_type"
            | "too_small"
            | "too_big"
            | "invalid_format"
            | "not_multiple_of"
          >,
        ) => string);
  };
};

export class ZodCustomErrorMap {
  private data: ZodCustomErrorMapData;

  public constructor(data: ZodCustomErrorMapData) {
    this.data = data;
  }

  private getCustomMessage<
    // biome-ignore lint/suspicious/noExplicitAny: The issue here is specific.
    Value extends string | ((issue: any) => string),
    Issue,
  >(value: Value, issue: Issue): string {
    if (typeof value === "function") return value(issue);

    return value;
  }

  public map(issue: $ZodRawIssue) {
    switch (issue.code) {
      case "invalid_type": {
        if (issue.input === undefined || issue.input === null) {
          return this.getCustomMessage(this.data.required, issue);
        }

        const messageDefinition =
          this.data.types[issue.expected] ?? this.data.types.default;

        return this.getCustomMessage(messageDefinition.invalid, issue);
      }

      case "too_small": {
        const { types } = this.data;

        if (issue.origin === "string") {
          if (issue.exact)
            return this.getCustomMessage(types.string.exact, issue);

          return this.getCustomMessage(
            types.string.greater_than_or_equal,
            issue,
          );
        }

        if (["number", "int", "bigint"].includes(issue.origin)) {
          if (issue.inclusive)
            return this.getCustomMessage(
              types.number.greater_than_or_equal,
              issue,
            );

          return this.getCustomMessage(types.number.greater_than, issue);
        }

        if (issue.origin === "array") {
          if (issue.exact)
            return this.getCustomMessage(types.array.exact, issue);

          return this.getCustomMessage(types.array.greater_than, issue);
        }

        if (issue.origin === "date") {
          return this.getCustomMessage(types.date.greater_than_or_equal, issue);
        }

        if (issue.origin === "file") {
          return this.getCustomMessage(types.file.greater_than_or_equal, issue);
        }

        return this.getCustomMessage(types.default.too_small, issue);
      }

      case "too_big": {
        const { types } = this.data;

        if (issue.origin === "string") {
          if (issue.exact)
            return this.getCustomMessage(types.string.exact, issue);

          return this.getCustomMessage(types.string.less_than_or_equal, issue);
        }

        if (["number", "int", "bigint"].includes(issue.origin)) {
          if (issue.inclusive)
            return this.getCustomMessage(
              types.number.less_than_or_equal,
              issue,
            );

          return this.getCustomMessage(types.number.less_than, issue);
        }

        if (issue.origin === "array") {
          if (issue.exact)
            return this.getCustomMessage(types.array.exact, issue);

          return this.getCustomMessage(types.array.less_than, issue);
        }

        if (issue.origin === "date") {
          return this.getCustomMessage(types.date.less_than_or_equal, issue);
        }

        if (issue.origin === "file") {
          return this.getCustomMessage(types.file.less_than_or_equal, issue);
        }

        return this.getCustomMessage(types.default.too_big, issue);
      }

      case "invalid_format": {
        const definitionMessage =
          this.data.formats[
            issue.format as keyof ZodCustomErrorMapData["formats"]
          ] ?? this.data.formats.default;

        return this.getCustomMessage(definitionMessage, issue);
      }

      case "not_multiple_of": {
        return this.getCustomMessage(
          this.data.types.number.not_multiple_of,
          issue,
        );
      }
    }

    const definitionMessage =
      this.data.others[issue.code as keyof typeof this.data.others] ??
      this.data.others.default;

    return this.getCustomMessage(definitionMessage, issue);
  }
}
