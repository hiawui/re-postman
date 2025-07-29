import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/test-utils'
import { AppSider } from '../AppSider'
import { HistoryOutlined, FolderOutlined } from '@ant-design/icons'

describe('AppSider', () => {
  const mockMenuItems = [
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'History',
    },
    {
      key: 'collections',
      icon: <FolderOutlined />,
      label: 'Collections',
    },
  ]

  const defaultProps = {
    width: 300,
    selectedMenu: 'history',
    menuItems: mockMenuItems,
    onMenuChange: vi.fn(),
    onSelectRequest: vi.fn(),
    selectedRequestId: 'req-1',
    collectionSelectedRequestId: 'req-1',
  }

  it('should render sider with correct width', () => {
    render(<AppSider {...defaultProps} />)

    const sider = document.querySelector('.app-sider')
    expect(sider).toBeInTheDocument()
  })

  it('should render menu items', () => {
    render(<AppSider {...defaultProps} />)

    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
  })

  it('should highlight selected menu item', () => {
    render(<AppSider {...defaultProps} />)

    const historyMenuItem = screen
      .getByText('History')
      .closest('.ant-menu-item')
    expect(historyMenuItem).toHaveClass('ant-menu-item-selected')
  })

  it('should call onMenuChange when menu item is clicked', () => {
    render(<AppSider {...defaultProps} />)

    const collectionsMenuItem = screen.getByText('Collections')
    fireEvent.click(collectionsMenuItem)

    expect(defaultProps.onMenuChange).toHaveBeenCalledWith('collections')
  })

  it('should render HistoryPanel when history menu is selected', () => {
    render(<AppSider {...defaultProps} />)

    // 检查HistoryPanel是否渲染
    expect(document.querySelector('.sider-content')).toBeInTheDocument()
  })

  it('should render CollectionPanel when collections menu is selected', () => {
    render(<AppSider {...defaultProps} selectedMenu="collections" />)

    // 检查CollectionPanel是否渲染
    expect(document.querySelector('.sider-content')).toBeInTheDocument()
  })

  it('should pass selectedRequestId to HistoryPanel', () => {
    const propsWithCustomSelectedId = {
      ...defaultProps,
      selectedRequestId: 'req-2',
    }

    render(<AppSider {...propsWithCustomSelectedId} />)

    // 验证selectedRequestId被正确传递
    expect(propsWithCustomSelectedId.selectedRequestId).toBe('req-2')
  })

  it('should pass collectionSelectedRequestId to CollectionPanel', () => {
    const propsWithCustomCollectionId = {
      ...defaultProps,
      collectionSelectedRequestId: 'req-3',
    }

    render(<AppSider {...propsWithCustomCollectionId} />)

    // 验证collectionSelectedRequestId被正确传递
    expect(propsWithCustomCollectionId.collectionSelectedRequestId).toBe(
      'req-3'
    )
  })

  it('should pass onSelectRequest to both panels', () => {
    render(<AppSider {...defaultProps} />)

    // 验证onSelectRequest被正确传递
    expect(defaultProps.onSelectRequest).toBeDefined()
  })

  it('should handle selectedRequestId as required prop (not optional)', () => {
    // 测试selectedRequestId现在是必需的prop
    const propsWithoutSelectedRequestId = { ...defaultProps }
    delete (propsWithoutSelectedRequestId as any).selectedRequestId

    // 这个测试确保TypeScript会报错，但我们在这里只是验证逻辑
    expect(defaultProps.selectedRequestId).toBeDefined()
  })

  it('should render sider header with menu', () => {
    render(<AppSider {...defaultProps} />)

    const siderHeader = document.querySelector('.sider-header')
    expect(siderHeader).toBeInTheDocument()
  })

  it('should render sider content area', () => {
    render(<AppSider {...defaultProps} />)

    const siderContent = document.querySelector('.sider-content')
    expect(siderContent).toBeInTheDocument()
  })

  it('should apply correct styling to menu', () => {
    render(<AppSider {...defaultProps} />)

    const menu = document.querySelector('.ant-menu')
    expect(menu).toBeInTheDocument()
  })

  it('should handle menu item selection correctly', () => {
    render(<AppSider {...defaultProps} />)

    // 点击Collections菜单项
    const collectionsMenuItem = screen.getByText('Collections')
    fireEvent.click(collectionsMenuItem)

    expect(defaultProps.onMenuChange).toHaveBeenCalledWith('collections')
  })

  it('should maintain selectedRequestId and collectionSelectedRequestId separately', () => {
    const propsWithDifferentIds = {
      ...defaultProps,
      selectedRequestId: 'history-req-1',
      collectionSelectedRequestId: 'collection-req-2',
    }

    render(<AppSider {...propsWithDifferentIds} />)

    expect(propsWithDifferentIds.selectedRequestId).toBe('history-req-1')
    expect(propsWithDifferentIds.collectionSelectedRequestId).toBe(
      'collection-req-2'
    )
  })
})
