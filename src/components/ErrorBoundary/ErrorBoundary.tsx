import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'
import { ErrorHandler, type AppError } from '@/utils/errorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: AppError
}

export class ErrorBoundary extends Component<Props, State> {
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
      // 如果有自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <Result
          status="error"
          title="应用出现错误"
          subTitle={this.state.error?.message || '发生了未知错误'}
          extra={[
            <Button type="primary" key="reset" onClick={this.handleReset}>
              重新加载
            </Button>,
            <Button key="report" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
          ]}
        />
      )
    }

    return this.props.children
  }
}
