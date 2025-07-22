import React from 'react'
import { List, Card, Tag, Typography, Empty, Button, Popconfirm } from 'antd'
import { DeleteOutlined, ClearOutlined } from '@ant-design/icons'
import { useAppStore } from '@/stores/appStore'
import { UrlDisplay } from '@/components/RequestPanel/UrlDisplay'
import type { HttpRequest } from '@/types'

const { Text } = Typography

interface HistoryPanelProps {
  onSelectRequest: (request: HttpRequest) => void
  selectedRequestId?: string
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  onSelectRequest,
  selectedRequestId,
}) => {
  const { history, removeHistoryItem, clearHistory } = useAppStore()

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    }
    return colors[method] || 'default'
  }

  const handleDelete = (index: number) => {
    removeHistoryItem(index)
  }

  const handleClearHistory = () => {
    clearHistory()
  }

  return (
    <div className="history-panel">
      <div
        className="history-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text strong>Request History</Text>
        {history.length > 0 && (
          <Popconfirm
            title="Clear History"
            description="Are you sure you want to clear all request history? This action cannot be undone."
            onConfirm={handleClearHistory}
            okText="Clear"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              icon={<ClearOutlined />}
              size="small"
              style={{ color: '#ff4d4f' }}
            />
          </Popconfirm>
        )}
      </div>

      {history.length === 0 ? (
        <Empty description="No requests yet" style={{ marginTop: 40 }} />
      ) : (
        <List
          dataSource={history}
          renderItem={(request, index) => (
            <List.Item
              className="history-item"
              onClick={() => onSelectRequest(request)}
              style={{
                backgroundColor:
                  selectedRequestId === request.id ? '#e6f7ff' : 'transparent',
                border:
                  selectedRequestId === request.id
                    ? '1px solid #1890ff'
                    : '1px solid transparent',
                borderRadius: 4,
                marginBottom: 4,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (selectedRequestId !== request.id) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }
              }}
              onMouseLeave={e => {
                if (selectedRequestId !== request.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <Card
                size="small"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={getMethodColor(request.method)}>
                    {request.method}
                  </Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <UrlDisplay
                      baseUrl={request.url}
                      params={request.params || []}
                      showPreview={false} // 历史记录显示原始 URL
                    />
                  </div>
                  <Popconfirm
                    title="删除历史记录"
                    description="确定要删除这条历史记录吗？"
                    onConfirm={e => {
                      e?.stopPropagation()
                      handleDelete(index)
                    }}
                    onCancel={e => e?.stopPropagation()}
                    okText="删除"
                    cancelText="取消"
                    okType="danger"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={e => e.stopPropagation()}
                      style={{ color: '#ff4d4f' }}
                    />
                  </Popconfirm>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
