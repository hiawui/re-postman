import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import type { HttpResponse } from '@/types'

interface ResponseStatusProps {
  response: HttpResponse
}

export const ResponseStatus: React.FC<ResponseStatusProps> = ({ response }) => {
  return (
    <Card size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Status"
            value={response.status}
            suffix={response.statusText}
            valueStyle={{
              color:
                response.status >= 200 && response.status < 300
                  ? '#3f8600'
                  : '#cf1322',
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Time"
            value={response.duration}
            suffix="ms"
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Size"
            value={response.size}
            suffix="bytes"
            prefix={<FileTextOutlined />}
          />
        </Col>
      </Row>
    </Card>
  )
}
