import React, { useState, useEffect } from 'react'
import { Input } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  extractBaseUrl,
  parseUrlParams,
  buildFullUrlForDisplay,
} from '@/utils/urlParser'

interface UrlInputProps {
  baseUrl: string
  params: [string, string][]
  onUrlChange: (url: string) => void
  onParamsChange: (params: [string, string][]) => void
  onSendRequest?: () => void
}

export const UrlInput: React.FC<UrlInputProps> = ({
  baseUrl,
  params,
  onUrlChange,
  onParamsChange,
  onSendRequest,
}) => {
  const { t } = useTranslation()
  // 内部状态：完整的 URL（包含参数）
  const [inputValue, setInputValue] = useState('')
  // 焦点状态：是否正在编辑
  const [isFocused, setIsFocused] = useState(false)

  // 当 props 变化时，更新内部状态（仅在非焦点状态下）
  useEffect(() => {
    if (!isFocused) {
      const fullUrl = buildFullUrlForDisplay(baseUrl, params)
      setInputValue(fullUrl)
    }
  }, [baseUrl, params, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setInputValue(newUrl)

    // 提取基础 URL（不包含参数）
    const extractedBaseUrl = extractBaseUrl(newUrl)

    // 解析 URL 中的查询参数
    const extractedParams = parseUrlParams(newUrl)

    // 同步更新父组件
    onUrlChange(extractedBaseUrl)
    onParamsChange(extractedParams)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (onSendRequest) {
        onSendRequest()
      }
    }
  }

  return (
    <Input
      size="large"
      placeholder={t('request.enterRequestUrl')}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      prefix={<GlobalOutlined />}
      style={{
        width: '100%',
        border: 'none',
        borderBottom: '1px solid #d9d9d9',
        borderRadius: 0,
        boxShadow: 'none',
        paddingLeft: 0,
        paddingRight: 0,
      }}
    />
  )
}
