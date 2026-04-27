import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { pt } from './locales/pt';
import { en } from './locales/en';
import { es } from './locales/es';

export const SUPPORTED_LANGS = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en',    label: 'English',   flag: '🇺🇸' },
  { code: 'es',    label: 'Español',   flag: '🇪🇸' },
] as const;

export type LangCode = typeof SUPPORTED_LANGS[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en', 'es'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'sinho_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
