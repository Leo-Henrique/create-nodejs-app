import prettyBytes from "pretty-bytes";
import { z } from "zod";
import { ZodCustomErrorMap } from "./zod-custom-error-map";

const zodUserFriendlyErrorsPtBr = new ZodCustomErrorMap({
  required: `O campo é obrigatório.`,
  types: {
    default: {
      invalid: ({ expected }) =>
        `O tipo do campo é inválido. É esperado que seja: "${expected}".`,
      too_small: "O campo é inválido.",
      too_big: "O campo é inválido.",
    },
    string: {
      invalid: "O campo deve ser um texto.",
      greater_than_or_equal: ({ minimum }) =>
        `O campo deve conter no mínimo ${minimum} caractere(s).`,
      less_than_or_equal: ({ maximum }) =>
        `O campo deve conter no máximo ${maximum} caractere(s).`,
      exact: ({ minimum, maximum }) =>
        `O campo deve conter exatamente ${minimum ?? maximum} caractere(s).`,
    },
    number: {
      invalid: "O campo deve ser um número.",
      greater_than: ({ minimum }) => `O número deve ser maior que ${minimum}.`,
      greater_than_or_equal: ({ minimum }) =>
        `O número deve ser maior ou igual a ${minimum}.`,
      less_than: ({ maximum }) => `O número deve ser menor que ${maximum}.`,
      less_than_or_equal: ({ maximum }) =>
        `O número deve ser menor ou igual a ${maximum}.`,
      not_multiple_of: ({ divisor }) =>
        `O número deve ser múltiplo de ${divisor}.`,
    },
    date: {
      invalid: "O campo deve ser uma data.",
      greater_than_or_equal: ({ minimum }) =>
        `A data deve ser maior ou igual a ${minimum.toLocaleString("pt-BR")}.`,
      less_than_or_equal: ({ maximum }) =>
        `A data deve ser menor ou igual a ${maximum.toLocaleString("pt-BR")}.`,
    },
    array: {
      invalid: "O campo deve ser uma lista.",
      greater_than: ({ minimum }) =>
        `Adicione no mínimo ${minimum} ${minimum > 1 ? "itens" : "item"}.`,
      less_than: ({ maximum }) =>
        `Adicione no máximo ${maximum} ${maximum > 1 ? "itens" : "item"}.`,
      exact: ({ minimum, maximum }) =>
        `Adicione exatamente ${minimum ?? maximum} ${((minimum ?? maximum) as number) > 1 ? "itens" : "item"}.`,
    },
    file: {
      invalid: "O campo deve ser um arquivo.",
      greater_than_or_equal: ({ minimum }) =>
        `O arquivo deve possuir no mínimo ${prettyBytes(minimum, { locale: "pt" })}.`,
      less_than_or_equal: ({ maximum }) =>
        `O arquivo deve possuir no máximo ${prettyBytes(maximum, { locale: "pt" })}.`,
    },
    boolean: { invalid: "O campo deve ser verdadeiro ou falso." },
    undefined: { invalid: "O campo deve estar vazio." },
    null: { invalid: "O campo deve estar vazio." },
  },
  formats: {
    default: `O formato do campo é inválido.`,

    // common
    email: "O e-mail é inválido.",
    url: "A URL é inválida.",
    regex: "O campo é inválido.",
    date: "A data é inválida.",
    time: "A hora é inválida.",
    datetime: "A data e a hora são inválidos.",
    emoji: "Emoji inválido.",
    starts_with: ({ prefix }) => `O campo deve iniciar com "${prefix}".`,
    ends_with: ({ suffix }) => `O campo deve terminar com "${suffix}".`,
    includes: ({ includes }) => `O campo deve incluir "${includes}".`,

    // programming
    uuid: "O UUID é inválido.",
    cuid: "O CUID é inválido.",
    nanoid: "O Nano ID é inválido.",
    base64: "Base64 inválido.",
    base64url: "Base64Url inválido.",
    jwt: "JSON Web Token inválido.",
    ipv4: "Endereço IPv4 inválido.",
    ipv6: "Endereço IPv6 inválido.",
    json_string: "JSON inválido.",
  },
  others: {
    default: "O campo é inválido.",
    custom: "O campo é inválido.",
    invalid_value: ({ values }) => `O campo deve ser exatamente "${values}".`,
    invalid_union: "O tipo do campo é inválido.",
  },
});

z.config({
  customError: (issue) => zodUserFriendlyErrorsPtBr.map(issue),
});
