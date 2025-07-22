import React, { useEffect, useState, useRef } from 'react'
import { ConfigProvider, Layout, Menu, Button, Space, Typography } from 'antd'
import {
  EnvironmentOutlined,
  FolderOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { TabBar } from '@/components/Tabs/TabBar'
import { EnvironmentPanel } from '@/components/EnvironmentPanel/EnvironmentPanel'
import { CollectionPanel } from '@/components/CollectionPanel/CollectionPanel'
import { HistoryPanel } from '@/components/HistoryPanel/HistoryPanel'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { useAppStore } from '@/stores/appStore'
import '@/styles/App.css'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const { addTab, updateRequest, activeTabId, setTabSource, tabs } =
    useAppStore()
  const [environmentPanelVisible, setEnvironmentPanelVisible] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState('history')
  const [siderWidth, setSiderWidth] = useState(300)
  const [isDragging, setIsDragging] = useState(false)
  const [collectionSelectedRequestId, setCollectionSelectedRequestId] =
    useState<string>('')
  const dragRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 初始化时如果没有标签页，创建一个默认标签页
    const { tabs } = useAppStore.getState()
    if (tabs.length === 0) {
      addTab()
    }
  }, [addTab])

  const handleSelectRequest = (request: any, collectionId?: string) => {
    // 恢复完整的请求参数，包括 headers、params、body、bodyType 和 response
    const restoredRequest = {
      ...request,
      headers: request.headers || {},
      params: request.params || {},
      body: request.body || '',
      bodyType: request.bodyType || 'json',
      response: request.response, // 恢复响应信息
    }

    // 如果有活跃的 tab，更新当前 tab；否则创建新 tab
    if (activeTabId) {
      updateRequest(activeTabId, restoredRequest)

      // 如果是从 collection 中选择的 request，设置 collection 信息
      if (collectionId) {
        setTabSource(activeTabId, collectionId, request.id)
      }
    } else {
      // 如果是从 collection 中选择的 request，设置 collection 信息
      if (collectionId) {
        // 需要获取新创建的 tab ID
        const { tabs } = useAppStore.getState()
        const newTabId = tabs[tabs.length - 1]?.id
        if (newTabId) {
          setTabSource(newTabId, collectionId, request.id)
        }
      }
    }

    // 更新 CollectionPanel 的选中状态
    if (collectionId) {
      setCollectionSelectedRequestId(request.id)
    }
  }

  const handleRequestAddedToCollection = (requestId: string, _: string) => {
    setCollectionSelectedRequestId(requestId)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newWidth = e.clientX
    if (newWidth >= 200 && newWidth <= 600) {
      setSiderWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const menuItems = [
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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <ErrorBoundary>
        <Layout className="app">
          <Header className="app-header">
            <div className="header-content">
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                RePostman
              </Title>
              <Space>
                <Button
                  icon={<EnvironmentOutlined />}
                  size="small"
                  onClick={() => setEnvironmentPanelVisible(true)}
                >
                  Environment
                </Button>
              </Space>
            </div>
          </Header>

          <Layout>
            <Sider width={siderWidth} className="app-sider">
              <div className="sider-header">
                <Menu
                  mode="horizontal"
                  selectedKeys={[selectedMenu]}
                  items={menuItems}
                  onClick={({ key }) => setSelectedMenu(key)}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                />
              </div>

              <div className="sider-content">
                {selectedMenu === 'history' && (
                  <HistoryPanel
                    onSelectRequest={handleSelectRequest}
                    selectedRequestId={
                      tabs.find(t => t.id === activeTabId)?.request?.id
                    }
                  />
                )}
                {selectedMenu === 'collections' && (
                  <CollectionPanel
                    onSelectRequest={handleSelectRequest}
                    selectedRequestId={collectionSelectedRequestId}
                  />
                )}
              </div>
            </Sider>

            {/* 拖拽分隔条 */}
            <div
              ref={dragRef}
              className="sider-resizer"
              onMouseDown={handleMouseDown}
            />

            <Content className="app-content">
              <TabBar
                onRequestAddedToCollection={handleRequestAddedToCollection}
              />
            </Content>
          </Layout>

          {/* 环境变量管理面板 */}
          <EnvironmentPanel
            visible={environmentPanelVisible}
            onClose={() => setEnvironmentPanelVisible(false)}
          />
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  )
}

export default App
