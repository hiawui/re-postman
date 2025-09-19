import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言包
import en from './locales/en.json'
import zh from './locales/zh.json'
import zhTW from './locales/zh_TW.json'
import ja from './locales/ja.json'

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  'zh-TW': {
    translation: zhTW,
  },
  ja: {
    translation: ja,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React 已经处理了 XSS
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
