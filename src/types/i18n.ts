export type Locale = "en" | "uz" | "ru";

export interface LocaleConfig {
  code: Locale;
  label: string;
  flag: string;
  dir: "ltr" | "rtl";
}
