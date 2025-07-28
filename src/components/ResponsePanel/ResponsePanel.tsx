import React from 'react'
import { Card, Tabs, Tag, Space, Typography } from 'antd'
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ResponseHeaders } from './ResponseHeaders'
import { ResponseBody } from './ResponseBody'
import type { HttpResponse } from '@/types'

const { TabPane } = Tabs
const { Text } = Typography

interface ResponsePanelProps {
  response: HttpResponse
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const { t } = useTranslation()

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 300 && status < 400) return 'warning'
    if (status >= 400 && status < 500) return 'error'
    if (status >= 500) return 'error'
    return 'default'
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} ${t('response.bytes')}`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} ${t('response.kilobytes')}`
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${t('response.megabytes')}`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}${t('response.milliseconds')}`
    return `${(ms / 1000).toFixed(2)}${t('response.seconds')}`
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
            <span>{t('response.response')}</span>
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
              <TabPane tab={t('response.body')} key="body">
                <ResponseBody response={response} />
              </TabPane>
              <TabPane tab={t('response.headers')} key="headers">
                <ResponseHeaders headers={response.headers} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  )
}
