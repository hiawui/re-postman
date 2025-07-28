import React from 'react'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'
import type { HttpMethod } from '@/types'

const { Option } = Select

interface MethodSelectorProps {
  value: HttpMethod
  onChange: (method: string) => void
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation()

  const HTTP_METHODS: { value: HttpMethod; label: string; color: string }[] = [
    { value: 'GET', label: t('methods.GET'), color: 'rgba(0, 0, 0, 0.88)' },
    { value: 'POST', label: t('methods.POST'), color: 'rgba(0, 0, 0, 0.88)' },
    { value: 'PUT', label: t('methods.PUT'), color: 'rgba(0, 0, 0, 0.88)' },
    {
      value: 'DELETE',
      label: t('methods.DELETE'),
      color: 'rgba(0, 0, 0, 0.88)',
    },
    { value: 'PATCH', label: t('methods.PATCH'), color: 'rgba(0, 0, 0, 0.88)' },
    { value: 'HEAD', label: t('methods.HEAD'), color: 'rgba(0, 0, 0, 0.88)' },
    {
      value: 'OPTIONS',
      label: t('methods.OPTIONS'),
      color: 'rgba(0, 0, 0, 0.88)',
    },
  ]

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
