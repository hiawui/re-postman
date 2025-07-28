import { describe, it, expect } from 'vitest'
import { render } from '../../../test/test-utils'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // 检查主要的布局容器是否存在
    expect(document.querySelector('.app')).toBeInTheDocument()
  })

  it('renders the main layout structure', () => {
    render(<App />)

    // 检查主要布局元素是否存在
    expect(document.querySelector('.app')).toBeInTheDocument()
    expect(document.querySelector('.app-content')).toBeInTheDocument()
  })

  it('renders header and sider components', () => {
    render(<App />)

    // 检查头部和侧边栏是否存在
    expect(document.querySelector('header')).toBeInTheDocument()
    expect(document.querySelector('aside')).toBeInTheDocument()
  })

  it('renders with antd ConfigProvider', () => {
    render(<App />)

    // 检查是否使用了 Ant Design 的配置提供者
    expect(document.querySelector('.ant-layout')).toBeInTheDocument()
  })
})
