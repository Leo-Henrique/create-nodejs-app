import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/pt/zod.json";
import zodI18nPtBrTranslation from "./zod-i18n-pt-br-translation.json";

export function startZodWithI18n() {
  i18next.init({
    lng: "pt",
    resources: {
      pt: {
        zod: {
          ...translation,
          ...zodI18nPtBrTranslation,
          errors: {
            ...translation.errors,
            ...zodI18nPtBrTranslation.errors,
          },
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  z.setErrorMap(zodI18nMap);
}
