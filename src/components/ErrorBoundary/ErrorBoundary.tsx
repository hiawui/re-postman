import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'
import { withTranslation, type WithTranslation } from 'react-i18next'
import { ErrorHandler, type AppError } from '@/utils/errorHandler'

interface Props extends WithTranslation {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: AppError
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新状态，下次渲染时显示错误UI
    return {
      hasError: true,
      error: ErrorHandler.createBoundaryError(error),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    const appError = ErrorHandler.createBoundaryError(error, errorInfo)
    this.setState({ error: appError })

    // 在开发环境下输出到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props
      // 如果有自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <Result
          status="error"
          title={t('services.operationFailed')}
          subTitle={this.state.error?.message || t('services.unknownError')}
          extra={[
            <Button type="primary" key="reset" onClick={this.handleReset}>
              {t('common.ok')}
            </Button>,
            <Button key="report" onClick={() => window.location.reload()}>
              {t('request.send')}
            </Button>,
          ]}
        />
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner)
