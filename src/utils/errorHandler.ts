import { message } from 'antd'
import i18n from '@/i18n'

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
        message: i18n.t('services.unknownError'),
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
        ? i18n.t('services.corsErrorExtension')
        : i18n.t('services.corsErrorWeb'),
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
        userMessage = i18n.t('services.crossOriginBlocked')
        break
      case 'NETWORK_ERROR':
        userMessage = i18n.t('services.networkConnectionFailed')
        break
      case 'VALIDATION_ERROR':
        userMessage = error.message
        break
      default:
        userMessage = i18n.t('services.operationFailed')
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
        return i18n.t('services.networkRequestFailed')
      }
      if (message.includes('timeout')) {
        return i18n.t('services.requestTimeout')
      }
      if (message.includes('abort')) {
        return i18n.t('services.requestCancelled')
      }

      return error.message
    }

    return i18n.t('services.networkConnectionFailed')
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
