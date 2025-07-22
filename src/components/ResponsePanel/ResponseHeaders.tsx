import React from 'react'
import { Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface HeaderItem {
  key: string
  name: string
  value: string
}

interface ResponseHeadersProps {
  headers: Record<string, string>
}

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({
  headers,
}) => {
  const dataSource: HeaderItem[] = Object.entries(headers).map(
    ([name, value]) => ({
      key: name,
      name,
      value,
    })
  )

  const columns: ColumnsType<HeaderItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: text => (
        <Text code style={{ fontSize: '12px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '60%',
      render: text => (
        <Text style={{ fontSize: '12px', wordBreak: 'break-all' }}>{text}</Text>
      ),
    },
  ]

  return (
    <div className="response-headers">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ y: 200 }}
        style={{ fontSize: '12px' }}
      />
    </div>
  )
}
