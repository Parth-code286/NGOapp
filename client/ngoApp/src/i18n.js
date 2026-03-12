import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { fetchTranslations } from './services/translationService.js';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: '{{lng}}', // i18next interpolates the requested language here
      request: async (options, url, payload, callback) => {
        try {
          const languageCode = url; 
          const dictionary = await fetchTranslations(languageCode);
          callback(null, { status: 200, data: dictionary });
        } catch (error) {
          callback(error, { status: 500 });
        }
      }
    },
    interpolation: {
      escapeValue: false // React handles escaping natively
    }
  });

export default i18n;
