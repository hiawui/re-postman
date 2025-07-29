import React from 'react'
import { Layout, Menu } from 'antd'
import { HistoryPanel } from '@/components/HistoryPanel/HistoryPanel'
import { CollectionPanel } from '@/components/CollectionPanel/CollectionPanel'
import type { HttpRequest } from '@/types'

const { Sider } = Layout

interface AppSiderProps {
  width: number
  selectedMenu: string
  menuItems: Array<{
    key: string
    icon: React.ReactNode
    label: string
  }>
  onMenuChange: (key: string) => void
  onSelectRequest: (request: HttpRequest, collectionId?: string) => void
  selectedRequestId: string
  collectionSelectedRequestId: string
}

export const AppSider: React.FC<AppSiderProps> = React.memo(
  ({
    width,
    selectedMenu,
    menuItems,
    onMenuChange,
    onSelectRequest,
    selectedRequestId,
    collectionSelectedRequestId,
  }) => {
    return (
      <Sider width={width} className="app-sider">
        <div className="sider-header">
          <Menu
            mode="horizontal"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => onMenuChange(key)}
            style={{ borderBottom: '1px solid #f0f0f0' }}
          />
        </div>

        <div className="sider-content">
          {selectedMenu === 'history' && (
            <HistoryPanel
              onSelectRequest={onSelectRequest}
              selectedRequestId={selectedRequestId}
            />
          )}
          {selectedMenu === 'collections' && (
            <CollectionPanel
              onSelectRequest={onSelectRequest}
              selectedRequestId={collectionSelectedRequestId}
            />
          )}
        </div>
      </Sider>
    )
  }
)

AppSider.displayName = 'AppSider'
