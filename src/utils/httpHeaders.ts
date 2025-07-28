import i18n from '@/i18n'

// 常见 HTTP Headers 数据
export interface HttpHeader {
  name: string
  description: string
  category: string
}

// 获取国际化的 HTTP Headers 数据
export const getCommonHttpHeaders = (): HttpHeader[] => [
  // 标准 HTTP Headers
  {
    name: 'Accept',
    description: i18n.t('utils.accept'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Accept-Charset',
    description: i18n.t('utils.acceptCharset'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Accept-Encoding',
    description: i18n.t('utils.acceptEncoding'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Accept-Language',
    description: i18n.t('utils.acceptLanguage'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Authorization',
    description: i18n.t('utils.authorization'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Cache-Control',
    description: i18n.t('utils.cacheControl'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Connection',
    description: i18n.t('utils.connection'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Content-Length',
    description: i18n.t('utils.contentLength'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Content-MD5',
    description: i18n.t('utils.contentMD5'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Content-Type',
    description: i18n.t('utils.contentType'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Cookie',
    description: i18n.t('utils.cookie'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Date',
    description: i18n.t('utils.date'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Expect',
    description: i18n.t('utils.expect'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'From',
    description: i18n.t('utils.from'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Host',
    description: i18n.t('utils.host'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'If-Match',
    description: i18n.t('utils.ifMatch'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'If-Modified-Since',
    description: i18n.t('utils.ifModifiedSince'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'If-None-Match',
    description: i18n.t('utils.ifNoneMatch'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'If-Range',
    description: i18n.t('utils.ifRange'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'If-Unmodified-Since',
    description: i18n.t('utils.ifUnmodifiedSince'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Max-Forwards',
    description: i18n.t('utils.maxForwards'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Origin',
    description: i18n.t('utils.origin'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Pragma',
    description: i18n.t('utils.pragma'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Proxy-Authorization',
    description: i18n.t('utils.proxyAuthorization'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Range',
    description: i18n.t('utils.range'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Referer',
    description: i18n.t('utils.referer'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'TE',
    description: i18n.t('utils.te'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Upgrade',
    description: i18n.t('utils.upgrade'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'User-Agent',
    description: i18n.t('utils.userAgent'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Via',
    description: i18n.t('utils.via'),
    category: i18n.t('utils.standardHttpHeaders'),
  },
  {
    name: 'Warning',
    description: i18n.t('utils.warning'),
    category: i18n.t('utils.standardHttpHeaders'),
  },

  // 常用自定义 Headers
  {
    name: 'X-Requested-With',
    description: i18n.t('utils.xRequestedWith'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Forwarded-For',
    description: i18n.t('utils.xForwardedFor'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Forwarded-Proto',
    description: i18n.t('utils.xForwardedProto'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Real-IP',
    description: i18n.t('utils.xRealIP'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Powered-By',
    description: i18n.t('utils.xPoweredBy'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Frame-Options',
    description: i18n.t('utils.xFrameOptions'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Content-Type-Options',
    description: i18n.t('utils.xContentTypeOptions'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-XSS-Protection',
    description: i18n.t('utils.xXSSProtection'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Download-Options',
    description: i18n.t('utils.xDownloadOptions'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Permitted-Cross-Domain-Policies',
    description: i18n.t('utils.xPermittedCrossDomainPolicies'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-DNS-Prefetch-Control',
    description: i18n.t('utils.xDnsPrefetchControl'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-UA-Compatible',
    description: i18n.t('utils.xUACompatible'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-API-Key',
    description: i18n.t('utils.xApiKey'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Auth-Token',
    description: i18n.t('utils.xAuthToken'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-CSRF-Token',
    description: i18n.t('utils.xCSRFToken'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Rate-Limit-Limit',
    description: i18n.t('utils.xRateLimitLimit'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Rate-Limit-Remaining',
    description: i18n.t('utils.xRateLimitRemaining'),
    category: i18n.t('utils.customHeaders'),
  },
  {
    name: 'X-Rate-Limit-Reset',
    description: i18n.t('utils.xRateLimitReset'),
    category: i18n.t('utils.customHeaders'),
  },
]

// 为了向后兼容，保留原来的常量
export const COMMON_HTTP_HEADERS = getCommonHttpHeaders()

// 按类别分组的 headers
export const getHeadersByCategory = (): Record<string, HttpHeader[]> => {
  const headers = getCommonHttpHeaders()
  return headers.reduce(
    (acc, header) => {
      if (!acc[header.category]) {
        acc[header.category] = []
      }
      acc[header.category].push(header)
      return acc
    },
    {} as Record<string, HttpHeader[]>
  )
}

// 为了向后兼容，保留原来的常量
export const HEADERS_BY_CATEGORY = getHeadersByCategory()

// 搜索 headers
export const searchHeaders = (query: string): HttpHeader[] => {
  if (!query.trim()) {
    return []
  }

  const lowerQuery = query.toLowerCase()
  const headers = getCommonHttpHeaders()
  return headers
    .filter(
      header =>
        header.name.toLowerCase().includes(lowerQuery) ||
        header.description.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10) // 限制返回数量
}
