import { VariableReplacer } from './variableReplacer'
import type { Environment } from '@/types'

// 解析 URL 中的查询参数
export const parseUrlParams = (url: string): [string, string][] => {
  try {
    const urlObj = new URL(url)
    const params: [string, string][] = []

    urlObj.searchParams.forEach((value, key) => {
      params.push([key, value])
    })

    return params
  } catch {
    // 如果 URL 无效，返回空数组
    return []
  }
}

// 从 URL 中提取基础 URL（不包含查询参数）
export const extractBaseUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
  } catch {
    // 如果 URL 无效，返回原 URL
    return url
  }
}

// 构建完整的 URL（包含参数）
export const buildFullUrl = (
  baseUrl: string,
  params: [string, string][]
): string => {
  try {
    const url = new URL(baseUrl)
    params.forEach(([key, value]) => {
      if (key.trim()) {
        url.searchParams.append(key.trim(), value.trim())
      }
    })
    return url.toString()
  } catch {
    return baseUrl
  }
}

export const processUrlForDisplay = (url: string): string => {
  return url.replace(/%7B%7B([^/#%?]+)%7D%7D/g, '{{$1}}')
}

// 构建完整的 URL for display
export const buildFullUrlForDisplay = (
  baseUrl: string,
  params: [string, string][]
): string => {
  const url = buildFullUrl(baseUrl, params)
  return processUrlForDisplay(url)
}

// 构建完整的 URL（包含参数和环境变量替换）
export const buildFullUrlWithEnvironment = (
  baseUrl: string,
  params: [string, string][],
  environments: Environment[] = []
): string => {
  try {
    // 先对 URL 进行 URL 解码
    const decodedBaseUrl = decodeURIComponent(baseUrl)

    // 替换 URL 中的环境变量
    const processedBaseUrl =
      environments.length > 0
        ? VariableReplacer.replaceVariablesWithMultipleEnvironments(
            decodedBaseUrl,
            environments
          )
        : decodedBaseUrl

    const url = new URL(processedBaseUrl)

    // 再替换参数中的环境变量
    const processedParams = params.map(([key, value]) => {
      if (key.trim()) {
        // 替换 key 和 value 中的环境变量
        const processedKey =
          environments.length > 0
            ? VariableReplacer.replaceVariablesWithMultipleEnvironments(
                key.trim(),
                environments
              )
            : key.trim()
        const processedValue =
          environments.length > 0
            ? VariableReplacer.replaceVariablesWithMultipleEnvironments(
                value.trim(),
                environments
              )
            : value.trim()

        return [processedKey, processedValue] as [string, string]
      }
      return [key, value] as [string, string]
    })

    // 添加处理后的参数
    processedParams.forEach(([key, value]) => {
      if (key.trim()) {
        url.searchParams.append(key.trim(), value.trim())
      }
    })

    return url.toString()
  } catch {
    return baseUrl
  }
}
