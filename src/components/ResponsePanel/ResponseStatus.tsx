import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { HttpResponse } from '@/types'

interface ResponseStatusProps {
  response: HttpResponse
}

export const ResponseStatus: React.FC<ResponseStatusProps> = ({ response }) => {
  const { t } = useTranslation()

  return (
    <Card size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title={t('response.status')}
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
            title={t('response.time')}
            value={response.duration}
            suffix={t('response.milliseconds')}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={t('response.size')}
            value={response.size}
            suffix={t('response.bytes')}
            prefix={<FileTextOutlined />}
          />
        </Col>
      </Row>
    </Card>
  )
}
