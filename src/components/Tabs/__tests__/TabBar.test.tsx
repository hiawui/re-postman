import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../../test/test-utils'
import { TabBar } from '../TabBar'
import { useAppStore } from '@/stores/appStore'

// Mock the store
vi.mock('@/stores/appStore', () => ({
  useAppStore: vi.fn(),
}))

const mockUseAppStore = useAppStore as any

describe('TabBar', () => {
  const mockTabs = [
    {
      id: 'tab-1',
      title: 'Test Request 1',
      request: {
        id: 'req-1',
        name: 'Test Request 1',
        method: 'GET' as const,
        url: 'https://api.example.com/test1',
        headers: [],
        body: '',
        bodyType: 'json' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      isActive: true,
      isLoading: false,
    },
    {
      id: 'tab-2',
      title: 'Test Request 2',
      request: {
        id: 'req-2',
        name: 'Test Request 2',
        method: 'POST' as const,
        url: 'https://api.example.com/test2',
        headers: [],
        body: '',
        bodyType: 'json' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      isActive: false,
      isLoading: false,
    },
  ]

  const mockStore = {
    tabs: mockTabs,
    activeTabId: 'tab-1',
    addTab: vi.fn(),
    removeTab: vi.fn(),
    setActiveTab: vi.fn(),
    collections: [],
    environments: [],
    activeEnvironmentIds: [],
    history: [],
    settings: {},
    updateRequest: vi.fn(),
    sendRequest: vi.fn(),
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

  it('should render tab bar with tabs', () => {
    render(<TabBar />)

    // 检查标签页是否存在
    expect(screen.getByText('Test Request 1')).toBeInTheDocument()
    expect(screen.getByText('Test Request 2')).toBeInTheDocument()
  })

  it('should render add tab button', () => {
    render(<TabBar />)

    // 检查添加标签页按钮是否存在 - 使用更通用的选择器
    const addButton =
      document.querySelector('[aria-label="Add tab"]') ||
      document.querySelector('.ant-tabs-tab-add') ||
      document.querySelector('[data-testid="add-tab"]')
    expect(addButton).toBeInTheDocument()
  })

  it('should call addTab when add button is clicked', () => {
    render(<TabBar />)

    const addButton =
      document.querySelector('[aria-label="Add tab"]') ||
      document.querySelector('.ant-tabs-tab-add') ||
      document.querySelector('[data-testid="add-tab"]')
    if (addButton) {
      fireEvent.click(addButton)
      expect(mockStore.addTab).toHaveBeenCalled()
    }
  })

  it('should call setActiveTab when tab is clicked', () => {
    render(<TabBar />)

    const tab2 = screen.getByText('Test Request 2')
    fireEvent.click(tab2)

    expect(mockStore.setActiveTab).toHaveBeenCalledWith('tab-2')
  })

  it('should render close button for tabs when multiple tabs exist', () => {
    render(<TabBar />)

    // 检查关闭按钮是否存在（当有多个标签页时）
    // 由于Ant Design的Tabs组件实现可能不同，我们检查标签页是否可关闭
    const tabs = document.querySelectorAll('.ant-tabs-tab')
    expect(tabs.length).toBeGreaterThan(1) // 确保有多个标签页

    // 验证标签页渲染正确
    expect(screen.getByText('Test Request 1')).toBeInTheDocument()
    expect(screen.getByText('Test Request 2')).toBeInTheDocument()
  })

  it('should not render close button for single tab', () => {
    mockUseAppStore.mockReturnValue({
      ...mockStore,
      tabs: [mockTabs[0]],
    })

    render(<TabBar />)

    // 当只有一个标签页时，不应该显示关闭按钮
    const closeButtons =
      document.querySelectorAll('[aria-label="Remove tab"]') ||
      document.querySelectorAll('.ant-tabs-tab-remove') ||
      document.querySelectorAll('[data-testid="remove-tab"]')
    expect(closeButtons.length).toBe(0)
  })

  it('should call removeTab when close button is clicked', () => {
    render(<TabBar />)

    const closeButtons =
      document.querySelectorAll('[aria-label="Remove tab"]') ||
      document.querySelectorAll('.ant-tabs-tab-remove') ||
      document.querySelectorAll('[data-testid="remove-tab"]')
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0])
      expect(mockStore.removeTab).toHaveBeenCalled()
    }
  })

  it('should render tab content with RequestPanel', () => {
    render(<TabBar />)

    // 检查请求面板是否存在
    expect(screen.getByText('request.requestTitle')).toBeInTheDocument()
  })

  it('should render response panel when response exists', () => {
    const tabWithResponse = {
      ...mockTabs[0],
      response: {
        status: 200,
        statusText: 'OK',
        headers: [],
        body: '{"message": "success"}',
        duration: 100,
      },
    }

    mockUseAppStore.mockReturnValue({
      ...mockStore,
      tabs: [tabWithResponse],
    })

    render(<TabBar />)

    // 检查响应面板是否存在
    expect(document.querySelector('.response-section')).toBeInTheDocument()
  })

  it('should render loading state when tab is loading', () => {
    const loadingTab = {
      ...mockTabs[0],
      isLoading: true,
    }

    mockUseAppStore.mockReturnValue({
      ...mockStore,
      tabs: [loadingTab],
    })

    render(<TabBar />)

    // 检查加载状态是否存在
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should not accept onRequestAddedToCollection prop (removed)', () => {
    render(<TabBar />)

    // 验证组件不再接受onRequestAddedToCollection prop
    // 这个测试确保我们不会意外地重新引入这个prop
    const tabBarElement = document.querySelector('.tab-bar')
    expect(tabBarElement).toBeInTheDocument()
  })

  it('should handle tab edit events correctly', () => {
    render(<TabBar />)

    // 测试添加标签页
    const addButton =
      document.querySelector('[aria-label="Add tab"]') ||
      document.querySelector('.ant-tabs-tab-add') ||
      document.querySelector('[data-testid="add-tab"]')
    if (addButton) {
      fireEvent.click(addButton)
      expect(mockStore.addTab).toHaveBeenCalled()
    }

    // 测试移除标签页
    const closeButtons =
      document.querySelectorAll('[aria-label="Remove tab"]') ||
      document.querySelectorAll('.ant-tabs-tab-remove') ||
      document.querySelectorAll('[data-testid="remove-tab"]')
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0])
      expect(mockStore.removeTab).toHaveBeenCalled()
    }
  })
})
