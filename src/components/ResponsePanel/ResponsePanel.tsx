import React from 'react'
import { Card, Tabs, Tag, Space, Typography } from 'antd'
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { ResponseHeaders } from './ResponseHeaders'
import { ResponseBody } from './ResponseBody'
import type { HttpResponse } from '@/types'

const { TabPane } = Tabs
const { Text } = Typography

interface ResponsePanelProps {
  response: HttpResponse
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 300 && status < 400) return 'warning'
    if (status >= 400 && status < 500) return 'error'
    if (status >= 500) return 'error'
    return 'default'
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="response-panel">
      <Card
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Response</span>
          </div>
        }
        size="small"
      >
        <div className="response-content">
          {/* 响应状态信息 */}
          <div className="response-status">
            <Tag color={getStatusColor(response.status)}>
              {response.status} {response.statusText}
            </Tag>

            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">{formatTime(response.duration)}</Text>
            </Space>

            <Space>
              <FileTextOutlined />
              <Text type="secondary">{formatSize(response.size)}</Text>
            </Space>
          </div>

          {/* 响应内容标签页 */}
          <div className="response-tabs">
            <Tabs defaultActiveKey="body" size="small">
              <TabPane tab="Body" key="body">
                <ResponseBody response={response} />
              </TabPane>
              <TabPane tab="Headers" key="headers">
                <ResponseHeaders headers={response.headers} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  )
}
