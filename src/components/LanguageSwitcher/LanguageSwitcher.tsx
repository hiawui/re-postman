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
    { value: 'zh', label: '中文', displayName: '中文' },
    { value: 'en', label: 'English', displayName: 'English' },
  ]

  // 语言映射表，用于处理各种语言变体
  const languageMapping: Record<string, string> = {
    zh: 'zh',
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'zh-HK': 'zh',
    'zh-SG': 'zh',
    en: 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
  }

  const handleLanguageChange = (language: string) => {
    // 根据选择的语言，设置最合适的语言代码
    const languageCode = language === 'zh' ? 'zh-CN' : 'en-US'
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
    return 'zh'
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
