import { message } from 'antd'

export interface AppError {
  code: string
  message: string
  details?: string
  timestamp: number
}

export class ErrorHandler {
  private static errorLog: AppError[] = []

  /**
   * 处理HTTP请求错误
   */
  static handleHttpError(error: unknown, context?: string): AppError {
    let appError: AppError

    if (error instanceof Error) {
      appError = {
        code: 'HTTP_ERROR',
        message: error.message,
        details: context,
        timestamp: Date.now(),
      }
    } else if (typeof error === 'string') {
      appError = {
        code: 'HTTP_ERROR',
        message: error,
        details: context,
        timestamp: Date.now(),
      }
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        details: context,
        timestamp: Date.now(),
      }
    }

    this.logError(appError)
    this.showUserFriendlyError(appError)

    return appError
  }

  /**
   * 处理网络错误
   */
  static handleNetworkError(error: unknown): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: this.getNetworkErrorMessage(error),
      timestamp: Date.now(),
    }

    this.logError(appError)
    this.showUserFriendlyError(appError)

    return appError
  }

  /**
   * 处理CORS错误
   */
  static handleCorsError(error: unknown): AppError {
    const isExtension =
      typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id

    const appError: AppError = {
      code: 'CORS_ERROR',
      message: isExtension
        ? 'CORS错误: Chrome扩展应该不受CORS限制，请检查manifest.json配置'
        : 'CORS错误: 请确保服务器支持CORS或使用HTTPS协议',
      details: error instanceof Error ? error.message : String(error),
      timestamp: Date.now(),
    }

    this.logError(appError)
    this.showUserFriendlyError(appError)

    return appError
  }

  /**
   * 处理验证错误
   */
  static handleValidationError(field: string, message: string): AppError {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`,
      timestamp: Date.now(),
    }

    this.logError(appError)
    this.showUserFriendlyError(appError)

    return appError
  }

  /**
   * 记录错误到日志
   */
  private static logError(error: AppError): void {
    this.errorLog.push(error)

    // 限制日志大小
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50)
    }

    // 在开发环境下输出到控制台
    console.error('App Error:', error)
  }

  /**
   * 显示用户友好的错误信息
   */
  private static showUserFriendlyError(error: AppError): void {
    let userMessage = error.message

    // 根据错误类型提供更友好的消息
    switch (error.code) {
      case 'CORS_ERROR':
        userMessage = '跨域请求被阻止，请检查网络设置'
        break
      case 'NETWORK_ERROR':
        userMessage = '网络连接失败，请检查网络设置'
        break
      case 'VALIDATION_ERROR':
        userMessage = error.message
        break
      default:
        userMessage = '操作失败，请稍后重试'
    }

    message.error(userMessage)
  }

  /**
   * 获取网络错误消息
   */
  private static getNetworkErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('fetch')) {
        return '网络请求失败，请检查网络连接'
      }
      if (message.includes('timeout')) {
        return '请求超时，请稍后重试'
      }
      if (message.includes('abort')) {
        return '请求被取消'
      }

      return error.message
    }

    return '网络连接失败'
  }

  /**
   * 获取错误日志
   */
  static getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  /**
   * 清空错误日志
   */
  static clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * 检查是否为可恢复的错误
   */
  static isRecoverableError(error: AppError): boolean {
    return ['NETWORK_ERROR', 'HTTP_ERROR'].includes(error.code)
  }

  /**
   * 创建错误边界错误
   */
  static createBoundaryError(
    error: Error,
    errorInfo?: React.ErrorInfo
  ): AppError {
    return {
      code: 'BOUNDARY_ERROR',
      message: error.message,
      details: errorInfo?.componentStack || undefined,
      timestamp: Date.now(),
    }
  }
}
