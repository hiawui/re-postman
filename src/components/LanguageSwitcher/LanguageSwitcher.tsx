import React from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'

const { Option } = Select

interface LanguageOption {
  value: string
  label: string
  displayName: string
}

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation()

  // 支持的语言配置
  const supportedLanguages: LanguageOption[] = [
    { value: 'en', label: 'English', displayName: 'English' },
    { value: 'zh', label: '简体中文', displayName: '简体中文' },
    { value: 'zh-TW', label: '繁體中文', displayName: '繁體中文' },
    { value: 'ja', label: '日本語', displayName: '日本語' },
  ]

  // 语言映射表，用于处理各种语言变体
  const languageMapping: Record<string, string> = {
    en: 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    zh: 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh-TW',
    'zh-HK': 'zh-TW',
    'zh-SG': 'zh',
    ja: 'ja',
    'ja-JP': 'ja',
  }

  const handleLanguageChange = (language: string) => {
    // 根据选择的语言，设置最合适的语言代码
    let languageCode: string
    switch (language) {
      case 'zh':
        languageCode = 'zh-CN'
        break
      case 'zh-TW':
        languageCode = 'zh-TW'
        break
      case 'ja':
        languageCode = 'ja-JP'
        break
      case 'en':
        languageCode = 'en-US'
        break
      default:
        languageCode = 'en-US'
    }
    i18n.changeLanguage(languageCode)
  }

  // 获取当前语言的值（用于 Select 的 value）
  const getCurrentLanguageValue = (): string => {
    const currentLang = i18n.language

    // 首先检查映射表
    if (languageMapping[currentLang]) {
      return languageMapping[currentLang]
    }

    // 如果没有找到映射，尝试匹配语言代码前缀
    const baseLang = currentLang.split('-')[0]
    if (languageMapping[baseLang]) {
      return languageMapping[baseLang]
    }

    // 如果都不匹配，返回默认语言
    return 'en'
  }

  return (
    <Select
      value={getCurrentLanguageValue()}
      onChange={handleLanguageChange}
      style={{ width: 140 }}
      suffixIcon={<GlobalOutlined />}
      placeholder={t('common.selectLanguage')}
    >
      {supportedLanguages.map(lang => (
        <Option key={lang.value} value={lang.value}>
          {lang.displayName}
        </Option>
      ))}
    </Select>
  )
}

export default LanguageSwitcher
