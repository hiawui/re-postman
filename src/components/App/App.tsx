import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { ConfigProvider, Layout } from 'antd'
import { FolderOutlined, HistoryOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { TabBar } from '@/components/Tabs/TabBar'
import { EnvironmentPanel } from '@/components/EnvironmentPanel/EnvironmentPanel'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { useAppOptimized } from '@/hooks/useAppOptimized'
import { AppHeader } from './AppHeader'
import { AppSider } from './AppSider'
import { SiderResizer } from './SiderResizer'
import '@/styles/App.css'

const { Content } = Layout

const App: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const { activeTabId, tabs, handleSelectRequest, handleAddTab } =
    useAppOptimized()

  const [environmentPanelVisible, setEnvironmentPanelVisible] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState('history')
  const [siderWidth, setSiderWidth] = useState(300)
  const [isDragging, setIsDragging] = useState(false)
  const [collectionSelectedRequestId, setCollectionSelectedRequestId] =
    useState<string>('')
  const dragRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create a default tab if no tabs exist on initialization
    if (tabs.length === 0) {
      handleAddTab()
    }
  }, [tabs.length, handleAddTab])

  const handleRequestAddedToCollection = useCallback(
    (requestId: string, _: string) => {
      setCollectionSelectedRequestId(requestId)
    },
    []
  )

  const handleEnvironmentPanelClose = useCallback(() => {
    setEnvironmentPanelVisible(false)
  }, [])

  const handleEnvironmentPanelOpen = useCallback(() => {
    setEnvironmentPanelVisible(true)
  }, [])

  const handleMenuChange = useCallback((key: string) => {
    setSelectedMenu(key)
  }, [])

  const menuItems = useMemo(
    () => [
      {
        key: 'history',
        icon: <HistoryOutlined />,
        label: t('navigation.history'),
      },
      {
        key: 'collections',
        icon: <FolderOutlined />,
        label: t('navigation.collections'),
      },
    ],
    [t]
  )

  const selectedRequestId = useMemo(() => {
    return tabs.find(t => t.id === activeTabId)?.request?.id
  }, [tabs, activeTabId])

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
          <AppHeader onEnvironmentClick={handleEnvironmentPanelOpen} />

          <Layout>
            <AppSider
              width={siderWidth}
              selectedMenu={selectedMenu}
              menuItems={menuItems}
              onMenuChange={handleMenuChange}
              onSelectRequest={handleSelectRequest}
              selectedRequestId={selectedRequestId}
              collectionSelectedRequestId={collectionSelectedRequestId}
            />

            <SiderResizer
              ref={dragRef}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              setSiderWidth={setSiderWidth}
            />

            <Content className="app-content">
              <TabBar
                onRequestAddedToCollection={handleRequestAddedToCollection}
              />
            </Content>
          </Layout>

          <EnvironmentPanel
            visible={environmentPanelVisible}
            onClose={handleEnvironmentPanelClose}
          />
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  )
})

App.displayName = 'App'

export default App
