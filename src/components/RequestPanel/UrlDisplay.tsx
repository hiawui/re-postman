import React from 'react'
import { Typography } from 'antd'
import {
  buildFullUrl,
  processUrlForDisplay,
  buildFullUrlWithEnvironment,
} from '@/utils/urlParser'
import type { Environment } from '@/types'

const { Text } = Typography

interface UrlDisplayProps {
  baseUrl: string
  params: [string, string][]
  environments?: Environment[]
  color?: string
  showPreview?: boolean
}

export const UrlDisplay: React.FC<UrlDisplayProps> = ({
  baseUrl,
  params,
  environments = [],
  color = '',
  showPreview = true, // 默认启用环境变量融合
}) => {
  const processedUrl =
    showPreview && environments.length > 0
      ? buildFullUrlWithEnvironment(baseUrl, params, environments)
      : buildFullUrl(baseUrl, params)
  return (
    <Text code style={{ color }}>
      {processUrlForDisplay(processedUrl)}
    </Text>
  )
}
