import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button, Typography } from 'antd'
import { BugOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text } = Typography

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })

    // 可以在这里发送错误报告到服务器
    this.reportError(error, errorInfo)
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // TODO: 实现错误报告功能
    console.log('Reporting error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Result
          status="error"
          icon={<BugOutlined />}
          title="应用出现错误"
          subTitle="抱歉，应用遇到了一个意外错误。"
          extra={[
            <Button
              key="reset"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={this.handleReset}
            >
              重试
            </Button>,
            <Button key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>,
          ]}
        >
          {this.state.error && (
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <Text strong>错误详情:</Text>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 12,
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </Result>
      )
    }

    return this.props.children
  }
}
