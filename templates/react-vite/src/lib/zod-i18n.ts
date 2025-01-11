import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/pt/zod.json";
import zodI18nTranslationForEndUsers from "./zod-i18n-translation-for-end-users.json";

export function startZodWithI18n() {
  i18next.init({
    lng: "pt",
    resources: {
      pt: {
        zod: { ...translation, ...zodI18nTranslationForEndUsers },
      },
    },
  });

  z.setErrorMap(zodI18nMap);
}

export { z };
