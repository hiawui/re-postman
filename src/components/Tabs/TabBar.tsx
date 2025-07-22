import React from 'react'
import { Tabs } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { RequestPanel } from '@/components/RequestPanel/RequestPanel'
import { ResponsePanel } from '@/components/ResponsePanel/ResponsePanel'
import { useAppStore } from '@/stores/appStore'
import type { Tab } from '@/types'

const { TabPane } = Tabs

interface TabBarProps {
  onRequestAddedToCollection?: (requestId: string, collectionId: string) => void
}

export const TabBar: React.FC<TabBarProps> = ({
  onRequestAddedToCollection,
}) => {
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useAppStore()

  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey)
  }

  const handleAddTab = () => {
    addTab()
  }

  const handleRemoveTab = (targetKey: string) => {
    removeTab(targetKey)
  }

  const handleTabEdit = (
    targetKey: string | React.MouseEvent | React.KeyboardEvent,
    action: 'add' | 'remove'
  ) => {
    if (action === 'add') {
      handleAddTab()
    } else if (action === 'remove' && typeof targetKey === 'string') {
      handleRemoveTab(targetKey)
    }
  }

  return (
    <div className="tab-bar">
      <Tabs
        type="editable-card"
        activeKey={activeTabId || undefined}
        onChange={handleTabChange}
        onEdit={handleTabEdit}
        addIcon={<PlusOutlined />}
        removeIcon={<CloseOutlined />}
        style={{ marginBottom: 0 }}
      >
        {tabs.map(tab => (
          <TabPane tab={tab.title} key={tab.id} closable={tabs.length > 1}>
            <TabContent
              tab={tab}
              onRequestAddedToCollection={onRequestAddedToCollection}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  )
}

const TabContent: React.FC<{
  tab: Tab
  onRequestAddedToCollection?: (requestId: string, collectionId: string) => void
}> = ({ tab, onRequestAddedToCollection }) => {
  return (
    <div className="tab-content">
      {/* 请求面板 */}
      <div className="request-section">
        <RequestPanel
          tab={tab}
          onRequestAddedToCollection={onRequestAddedToCollection}
        />
      </div>

      {/* 响应面板 */}
      {tab.response && (
        <div className="response-section">
          <ResponsePanel response={tab.response} />
        </div>
      )}

      {/* 加载状态 */}
      {tab.isLoading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}
