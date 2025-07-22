// 常见 HTTP Headers 数据
export interface HttpHeader {
  name: string
  description: string
  category: string
}

export const COMMON_HTTP_HEADERS: HttpHeader[] = [
  // 标准 HTTP Headers
  {
    name: 'Accept',
    description: '客户端能够处理的内容类型',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Accept-Charset',
    description: '客户端支持的字符集',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Accept-Encoding',
    description: '客户端支持的编码方式',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Accept-Language',
    description: '客户端支持的语言',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Authorization',
    description: '身份验证信息',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Cache-Control',
    description: '缓存控制指令',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Connection',
    description: '连接类型',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Content-Length',
    description: '请求体长度',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Content-MD5',
    description: '请求体的 MD5 校验和',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Content-Type',
    description: '请求体的媒体类型',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Cookie',
    description: '客户端发送的 Cookie',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Date',
    description: '请求发送的日期和时间',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Expect',
    description: '客户端期望的服务器行为',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'From',
    description: '请求发送者的电子邮件地址',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Host',
    description: '请求的目标主机和端口',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'If-Match',
    description: '条件请求：实体标签匹配',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'If-Modified-Since',
    description: '条件请求：最后修改时间',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'If-None-Match',
    description: '条件请求：实体标签不匹配',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'If-Range',
    description: '条件请求：范围请求',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'If-Unmodified-Since',
    description: '条件请求：未修改时间',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Max-Forwards',
    description: '最大转发次数',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Origin',
    description: '请求的来源',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Pragma',
    description: '实现特定的指令',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Proxy-Authorization',
    description: '代理服务器身份验证',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Range',
    description: '请求的部分内容',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Referer',
    description: '请求的来源页面',
    category: 'Standard HTTP Headers',
  },
  { name: 'TE', description: '传输编码', category: 'Standard HTTP Headers' },
  {
    name: 'Upgrade',
    description: '升级协议',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'User-Agent',
    description: '客户端信息',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Via',
    description: '代理服务器信息',
    category: 'Standard HTTP Headers',
  },
  {
    name: 'Warning',
    description: '警告信息',
    category: 'Standard HTTP Headers',
  },

  // 常用自定义 Headers
  {
    name: 'X-Requested-With',
    description: 'AJAX 请求标识',
    category: 'Custom Headers',
  },
  {
    name: 'X-Forwarded-For',
    description: '客户端真实 IP',
    category: 'Custom Headers',
  },
  {
    name: 'X-Forwarded-Proto',
    description: '客户端协议',
    category: 'Custom Headers',
  },
  {
    name: 'X-Real-IP',
    description: '真实 IP 地址',
    category: 'Custom Headers',
  },
  {
    name: 'X-Powered-By',
    description: '服务器技术信息',
    category: 'Custom Headers',
  },
  {
    name: 'X-Frame-Options',
    description: '点击劫持保护',
    category: 'Custom Headers',
  },
  {
    name: 'X-Content-Type-Options',
    description: 'MIME 类型嗅探保护',
    category: 'Custom Headers',
  },
  {
    name: 'X-XSS-Protection',
    description: 'XSS 保护',
    category: 'Custom Headers',
  },
  {
    name: 'X-Download-Options',
    description: '下载选项',
    category: 'Custom Headers',
  },
  {
    name: 'X-Permitted-Cross-Domain-Policies',
    description: '跨域策略',
    category: 'Custom Headers',
  },
  {
    name: 'X-DNS-Prefetch-Control',
    description: 'DNS 预取控制',
    category: 'Custom Headers',
  },
  {
    name: 'X-UA-Compatible',
    description: 'IE 兼容模式',
    category: 'Custom Headers',
  },
  { name: 'X-API-Key', description: 'API 密钥', category: 'Custom Headers' },
  { name: 'X-Auth-Token', description: '认证令牌', category: 'Custom Headers' },
  {
    name: 'X-CSRF-Token',
    description: 'CSRF 令牌',
    category: 'Custom Headers',
  },
  {
    name: 'X-Rate-Limit-Limit',
    description: '速率限制上限',
    category: 'Custom Headers',
  },
  {
    name: 'X-Rate-Limit-Remaining',
    description: '剩余请求次数',
    category: 'Custom Headers',
  },
  {
    name: 'X-Rate-Limit-Reset',
    description: '速率限制重置时间',
    category: 'Custom Headers',
  },
]

// 按类别分组的 headers
export const HEADERS_BY_CATEGORY = COMMON_HTTP_HEADERS.reduce(
  (acc, header) => {
    if (!acc[header.category]) {
      acc[header.category] = []
    }
    acc[header.category].push(header)
    return acc
  },
  {} as Record<string, HttpHeader[]>
)

// 搜索 headers
export const searchHeaders = (query: string): HttpHeader[] => {
  if (!query.trim()) {
    return []
  }

  const lowerQuery = query.toLowerCase()
  return COMMON_HTTP_HEADERS.filter(
    header =>
      header.name.toLowerCase().includes(lowerQuery) ||
      header.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 10) // 限制返回数量
}
