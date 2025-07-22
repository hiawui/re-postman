import React from 'react'
import { Select } from 'antd'
import type { HttpMethod } from '@/types'

const { Option } = Select

interface MethodSelectorProps {
  value: HttpMethod
  onChange: (method: string) => void
}

const HTTP_METHODS: { value: HttpMethod; label: string; color: string }[] = [
  { value: 'GET', label: 'GET', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'POST', label: 'POST', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'PUT', label: 'PUT', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'DELETE', label: 'DELETE', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'PATCH', label: 'PATCH', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'HEAD', label: 'HEAD', color: 'rgba(0, 0, 0, 0.88)' },
  { value: 'OPTIONS', label: 'OPTIONS', color: 'rgba(0, 0, 0, 0.88)' },
]

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ width: 100 }}
      size="middle"
    >
      {HTTP_METHODS.map(method => (
        <Option key={method.value} value={method.value}>
          <span style={{ color: method.color, fontWeight: 'normal' }}>
            {method.label}
          </span>
        </Option>
      ))}
    </Select>
  )
}
