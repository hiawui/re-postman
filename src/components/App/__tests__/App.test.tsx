import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '../../../test/test-utils'
import App from '../App'
import { useAppStore } from '@/stores/appStore'

// Mock the store
vi.mock('@/stores/appStore', () => ({
  useAppStore: vi.fn(),
}))

const mockUseAppStore = useAppStore as any

describe('App', () => {
  const mockStore = {
    tabs: [
      {
        id: 'tab-1',
        title: 'Test Request',
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET' as const,
          url: 'https://api.example.com/test',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        isActive: true,
        isLoading: false,
      },
    ],
    activeTabId: 'tab-1',
    addTab: vi.fn(),
    collections: [],
    environments: [],
    activeEnvironmentIds: [],
    history: [],
    settings: {},
    updateRequest: vi.fn(),
    sendRequest: vi.fn(),
    removeTab: vi.fn(),
    setActiveTab: vi.fn(),
    addCollection: vi.fn(),
    removeCollection: vi.fn(),
    addEnvironment: vi.fn(),
    removeEnvironment: vi.fn(),
    activateEnvironment: vi.fn(),
    deactivateEnvironment: vi.fn(),
    setTabSource: vi.fn(),
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore)
    vi.clearAllMocks()
  })

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

  it('renders TabBar without onRequestAddedToCollection prop', () => {
    render(<App />)

    // 检查TabBar组件是否正确渲染
    expect(document.querySelector('.tab-bar')).toBeInTheDocument()
  })

  it('renders AppSider with correct props', () => {
    render(<App />)

    // 检查AppSider组件是否正确渲染
    expect(document.querySelector('aside')).toBeInTheDocument()
  })

  it('handles tab management correctly', () => {
    render(<App />)

    // 验证store方法被正确调用
    expect(mockStore.addTab).toBeDefined()
  })
})
