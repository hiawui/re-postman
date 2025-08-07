import type { HttpRequest, HttpResponse, Environment } from '@/types'
import { VariableReplacer } from '@/utils/variableReplacer'
import { ErrorHandler } from '@/utils/errorHandler'
import i18n from '@/i18n'

export class HttpService {
  static async sendRequest(
    request: HttpRequest,
    environments?: Environment[]
  ): Promise<HttpResponse> {
    const startTime = Date.now()

    try {
      // 应用环境变量替换
      const processedRequest = this.processRequestWithEnvironment(
        request,
        environments
      )

      // 构建请求配置
      const config = this.buildRequestConfig(processedRequest)

      // 检查是否在Chrome扩展环境中
      let response: Response
      if (
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.id
      ) {
        // 使用Chrome扩展的fetch，不受CORS限制
        response = await this.sendRequestAsExtension(processedRequest, config)
      } else {
        // 普通web环境，使用标准fetch
        response = await fetch(processedRequest.url, config)
      }

      // 获取响应数据
      const responseText = await response.text()

      // 构建响应头对象
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      const httpResponse: HttpResponse = {
        status: response.status,
        statusText: response.statusText,
        headers,
        body: responseText, // 直接使用原始文本，不进行JSON解析
        duration,
        size: responseText.length,
        url: processedRequest.url,
      }

      return httpResponse
    } catch (error) {
      // 使用统一的错误处理
      const appError = this.handleRequestError(error, request.url)

      return {
        status: 0,
        statusText: i18n.t('services.networkError'),
        headers: {},
        body: appError.message,
        size: 0,
        duration: 0,
        url: request.url,
      }
    }
  }

  private static handleRequestError(
    error: unknown,
    url: string
  ): ReturnType<typeof ErrorHandler.handleHttpError> {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // 检查是否为CORS错误
    if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
      return ErrorHandler.handleCorsError(error)
    }

    // 检查是否为网络错误
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return ErrorHandler.handleNetworkError(error)
    }

    // 其他HTTP错误
    return ErrorHandler.handleHttpError(error, `Request to ${url}`)
  }

  private static async sendRequestAsExtension(
    request: HttpRequest,
    config: RequestInit
  ): Promise<Response> {
    // Chrome扩展环境下的fetch不受CORS限制
    // 直接使用fetch，因为Chrome扩展有特殊权限
    // 注意：不要使用 mode: 'no-cors'，因为它会限制自定义headers
    return fetch(request.url, config)
  }

  private static buildRequestConfig(request: HttpRequest): RequestInit {
    const headers = this.buildHeaders(request)

    const config: RequestInit = {
      method: request.method,
      headers,
    }

    // 添加请求体
    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (request.bodyType === 'form-data') {
        // 处理 FormData
        const formData = new FormData()

        // 如果有详细的 formData 数据，使用它
        if (request.formData && request.formData.length > 0) {
          request.formData.forEach(item => {
            if (item.key && item.key.trim()) {
              if (item.type === 'file' && item.file) {
                formData.append(item.key, item.file)
              } else {
                formData.append(item.key, item.value)
              }
            }
          })
        } else {
          // 回退到字符串解析方式
          const pairs = request.body.split('&')
          pairs.forEach(pair => {
            const [key, value = ''] = pair.split('=')
            // 过滤掉空key（key为空或只包含空白字符）
            if (key && key.trim()) {
              formData.append(
                decodeURIComponent(key),
                decodeURIComponent(value)
              )
            }
          })
        }

        config.body = formData
        // 删除 Content-Type，让浏览器自动设置
        delete headers['Content-Type']
        config.headers = headers
      } else if (request.bodyType === 'x-www-form-urlencoded') {
        // 处理 x-www-form-urlencoded，过滤空key
        const pairs = request.body.split('&')
        const filteredPairs = pairs.filter(pair => {
          const [key] = pair.split('=')
          // 过滤掉空key（key为空或只包含空白字符）
          return key && key.trim()
        })
        config.body = filteredPairs.join('&')
      } else {
        // 其他类型直接使用 body 字符串
        config.body = request.body
      }
    }

    return config
  }

  private static buildHeaders(request: HttpRequest): Record<string, string> {
    const headers = Object.fromEntries(
      request.headers.filter(([k, v]) => k.trim() && v.trim())
    )

    // 如果没有设置Content-Type，根据请求体类型和HTTP方法自动设置
    if (!headers['Content-Type'] && request.body && request.body.trim()) {
      // 只有有请求体的方法才需要设置 Content-Type
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        switch (request.bodyType) {
          case 'json':
            headers['Content-Type'] = 'application/json'
            break
          case 'xml':
            headers['Content-Type'] = 'application/xml'
            break
          case 'form-data':
            // FormData 不需要设置 Content-Type，浏览器会自动设置
            break
          case 'x-www-form-urlencoded':
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
            break
          default:
            // 尝试解析为 JSON，如果失败则设为 text/plain
            try {
              JSON.parse(request.body)
              headers['Content-Type'] = 'application/json'
            } catch {
              headers['Content-Type'] = 'text/plain'
            }
        }
      }
    }

    return headers
  }

  private static processRequestWithEnvironment(
    request: HttpRequest,
    environments?: Environment[]
  ): HttpRequest {
    if (!environments || environments.length === 0) return request

    // 将数组格式转换为对象格式进行处理
    const headersObject = Object.fromEntries(request.headers)
    const processedHeaders =
      VariableReplacer.replaceVariablesInObjectWithMultipleEnvironments(
        headersObject,
        environments
      )

    let processedParams: [string, string][] | undefined
    if (request.params) {
      const paramsObject = Object.fromEntries(request.params)
      const processedParamsObject =
        VariableReplacer.replaceVariablesInObjectWithMultipleEnvironments(
          paramsObject,
          environments
        )
      processedParams = Object.entries(processedParamsObject) as [
        string,
        string,
      ][]
    }

    return {
      ...request,
      url: VariableReplacer.replaceVariablesWithMultipleEnvironments(
        request.url,
        environments
      ),
      headers: Object.entries(processedHeaders) as [string, string][],
      body: request.body
        ? VariableReplacer.replaceVariablesWithMultipleEnvironments(
            request.body,
            environments
          )
        : request.body,
      params: processedParams,
    }
  }

  static parseUrl(url: string): {
    baseUrl: string
    params: Record<string, string>
  } {
    try {
      const urlObj = new URL(url)
      const params: Record<string, string> = {}

      urlObj.searchParams.forEach((value, key) => {
        params[key] = value
      })

      return {
        baseUrl: urlObj.origin + urlObj.pathname,
        params,
      }
    } catch {
      return {
        baseUrl: url,
        params: {},
      }
    }
  }

  static buildUrl(baseUrl: string, params: Record<string, string>): string {
    try {
      const url = new URL(baseUrl)

      Object.entries(params).forEach(([key, value]) => {
        if (key && value) {
          url.searchParams.set(key, value)
        }
      })

      return url.toString()
    } catch {
      // 如果baseUrl不是有效的URL，直接返回
      return baseUrl
    }
  }
}
