import React, { useState, useEffect } from 'react'
import { Input, Row, Col, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface ParamsEditorProps {
  value: [string, string][]
  onChange: (params: [string, string][]) => void
}

export const ParamsEditor: React.FC<ParamsEditorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const [params, setParams] = useState<Array<{ key: string; value: string }>>(
    () => {
      return value.length > 0
        ? value.map(([key, val]) => ({ key, value: val }))
        : [{ key: '', value: '' }]
    }
  )

  // 当 value 改变时，更新 params
  useEffect(() => {
    if (value.length > 0) {
      const paramsFromValue = value.map(([key, val]) => ({ key, value: val }))

      // 检查最后一行是否为空行，如果不是则添加空行
      const lastParam = paramsFromValue[paramsFromValue.length - 1]
      if (
        lastParam &&
        (lastParam.key.trim() !== '' || lastParam.value.trim() !== '')
      ) {
        paramsFromValue.push({ key: '', value: '' })
      }

      setParams(paramsFromValue)
    } else {
      // 如果 value 为空，保持至少一个空行
      setParams([{ key: '', value: '' }])
    }
  }, [value])

  const handleParamChange = (
    index: number,
    field: 'key' | 'value',
    newValue: string
  ) => {
    const newParams = [...params]
    newParams[index][field] = newValue
    setParams(newParams)

    // 转换为数组格式并通知父组件（允许重复的 key）
    const paramsArray = newParams.map(
      param => [param.key.trim(), param.value] as [string, string]
    )

    onChange(paramsArray)
  }

  const handleFocus = (index: number) => {
    // 如果焦点在最后一行，自动添加新行
    if (index === params.length - 1) {
      setParams([...params, { key: '', value: '' }])
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // 如果按下 Enter 键且在最后一行，添加新行
    if (e.key === 'Enter' && index === params.length - 1) {
      setParams([...params, { key: '', value: '' }])
    }
  }

  const removeParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index)
    setParams(newParams)

    // 转换为数组格式并通知父组件（允许重复的 key）
    const paramsArray = newParams
      .filter(param => param.key.trim())
      .map(param => [param.key.trim(), param.value] as [string, string])

    onChange(paramsArray)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          fontSize: '14px',
          fontWeight: 600,
          color: '#262626',
          marginBottom: 8,
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {t('request.urlParameters')}
      </div>

      {params.map((param, index) => (
        <Row key={index} gutter={15} style={{ marginBottom: 8 }} align="middle">
          <Col flex="250px">
            <Input
              placeholder={t('request.urlParameterKey')}
              value={param.key}
              onChange={e => handleParamChange(index, 'key', e.target.value)}
              onFocus={() => handleFocus(index)}
              onKeyDown={e => handleKeyDown(index, e)}
              size="small"
              style={{
                fontSize: '12px',
                border: 'none',
                borderBottom: '1px solid #d9d9d9',
                borderRadius: 0,
                boxShadow: 'none',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            />
          </Col>
          <Col flex="250px">
            <Input
              placeholder={t('request.value')}
              value={param.value}
              onChange={e => handleParamChange(index, 'value', e.target.value)}
              onFocus={() => handleFocus(index)}
              onKeyDown={e => handleKeyDown(index, e)}
              size="small"
              style={{
                fontSize: '12px',
                border: 'none',
                borderBottom: '1px solid #d9d9d9',
                borderRadius: 0,
                boxShadow: 'none',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            />
          </Col>
          <Col flex="none">
            {index !== params.length - 1 && (
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => removeParam(index)}
                tabIndex={-1}
                style={{ color: '#ff4d4f' }}
              />
            )}
          </Col>
        </Row>
      ))}
    </div>
  )
}
