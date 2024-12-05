import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './public/locales/en/common.json'; // Ajuste o caminho conforme necessário
import ptBRTranslations from './public/locales/pt-BR/common.json'; // Ajuste o caminho conforme necessário

i18n
  .use(initReactI18next) // Passa a instância do i18next para o react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ptBR: {
        translation: ptBRTranslations,
      },
    },
    lng: 'ptBR', // Linguagem padrão
    fallbackLng: 'ptBR', // Linguagem de fallback
    interpolation: {
      escapeValue: false, // React já faz o escape
    },
  });

export default i18n;