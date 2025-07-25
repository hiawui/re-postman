import React, { useState, useEffect } from 'react'
import { Input, Select, Row, Col, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
const { TextArea } = Input
const { Option } = Select

interface FormDataItem {
  key: string
  value: string
  type: 'text' | 'file'
}

interface BodyEditorProps {
  value: string
  onChange: (body: string) => void
  onBodyTypeChange?: (bodyType: string) => void
}

type BodyType = 'json' | 'xml' | 'text' | 'form-data' | 'x-www-form-urlencoded'

export const BodyEditor: React.FC<BodyEditorProps> = ({
  value,
  onChange,
  onBodyTypeChange,
}) => {
  const [bodyType, setBodyType] = useState<BodyType>('json')
  const [formData, setFormData] = useState<FormDataItem[]>([
    { key: '', value: '', type: 'text' },
  ])

  // 从字符串值解析 form-data
  const parseFormDataFromString = (value: string): FormDataItem[] => {
    if (!value || !value.includes('=')) {
      return [{ key: '', value: '', type: 'text' }]
    }

    const pairs = value.split('&')
    const items: FormDataItem[] = []

    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      if (key && value !== undefined) {
        items.push({
          key: decodeURIComponent(key),
          value: decodeURIComponent(value),
          type: 'text',
        })
      }
    })

    return items.length > 0 ? items : [{ key: '', value: '', type: 'text' }]
  }

  // 当 value 或 bodyType 改变时，更新 formData
  useEffect(() => {
    if (bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') {
      const parsedFormData = parseFormDataFromString(value)

      // 检查最后一行是否为空行，如果不是则添加空行
      const lastItem = parsedFormData[parsedFormData.length - 1]
      if (
        lastItem &&
        (lastItem.key.trim() !== '' || lastItem.value.trim() !== '')
      ) {
        parsedFormData.push({ key: '', value: '', type: 'text' })
      }

      setFormData(parsedFormData)
    }
  }, [value, bodyType])

  const handleBodyChange = (newValue: string) => {
    onChange(newValue)
  }

  const handleBodyTypeChange = (type: BodyType) => {
    setBodyType(type)
    onBodyTypeChange?.(type)
    // 根据类型设置默认内容
    if (type === 'json' && !value) {
      onChange('{\n  \n}')
    } else if (type === 'xml' && !value) {
      onChange('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  \n</root>')
    } else if (type === 'form-data' || type === 'x-www-form-urlencoded') {
      // 将 formData 转换为字符串
      const formDataString = formData
        .filter(item => item.key.trim())
        .map(item => `${item.key}=${item.value}`)
        .join('&')
      onChange(formDataString)
    }
  }

  const formatBody = () => {
    if (bodyType === 'json') {
      try {
        const parsed = JSON.parse(value)
        onChange(JSON.stringify(parsed, null, 2))
      } catch (error) {
        // 如果JSON无效，不进行格式化
      }
    }
  }

  const handleFormDataChange = (
    index: number,
    field: keyof FormDataItem,
    value: string
  ) => {
    const newFormData = [...formData]
    newFormData[index] = { ...newFormData[index], [field]: value }
    setFormData(newFormData)

    // 转换为字符串并更新
    const formDataString = newFormData
      .map(item => `${item.key}=${item.value}`)
      .join('&')
    onChange(formDataString)
  }

  const handleFormDataFocus = (index: number) => {
    // 如果焦点在最后一行，自动添加新行
    if (index === formData.length - 1) {
      setFormData([...formData, { key: '', value: '', type: 'text' }])
    }
  }

  const handleFormDataKeyDown = (index: number, e: React.KeyboardEvent) => {
    // 如果按下 Enter 键且在最后一行，添加新行
    if (e.key === 'Enter' && index === formData.length - 1) {
      setFormData([...formData, { key: '', value: '', type: 'text' }])
    }
  }

  const removeFormDataItem = (index: number) => {
    const newFormData = formData.filter((_, i) => i !== index)
    setFormData(newFormData)

    // 转换为字符串并更新
    const formDataString = newFormData
      .filter(item => item.key.trim())
      .map(item => `${item.key}=${item.value}`)
      .join('&')
    onChange(formDataString)
  }

  const renderFormDataEditor = () => {
    return (
      <div>
        {formData.map((item, index) => (
          <Row
            key={index}
            gutter={15}
            style={{ marginBottom: 8 }}
            align="middle"
          >
            <Col flex="250px">
              <Input
                placeholder="Key"
                value={item.key}
                onChange={e =>
                  handleFormDataChange(index, 'key', e.target.value)
                }
                onFocus={() => handleFormDataFocus(index)}
                onKeyDown={e => handleFormDataKeyDown(index, e)}
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
                placeholder="Value"
                value={item.value}
                onChange={e =>
                  handleFormDataChange(index, 'value', e.target.value)
                }
                onFocus={() => handleFormDataFocus(index)}
                onKeyDown={e => handleFormDataKeyDown(index, e)}
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
              <Select
                value={item.type}
                onChange={value => handleFormDataChange(index, 'type', value)}
                size="small"
                style={{ width: 80, fontSize: '12px' }}
              >
                <Option value="text">Text</Option>
                <Option value="file">File</Option>
              </Select>
            </Col>
            <Col flex="none">
              {index !== formData.length - 1 && (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => removeFormDataItem(index)}
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

  const renderBodyInput = () => {
    switch (bodyType) {
      case 'json':
      case 'xml':
      case 'text':
        return (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: '12px' }}>Body Content</span>
              {bodyType === 'json' && (
                <button
                  onClick={formatBody}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1890ff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Format JSON
                </button>
              )}
            </div>
            <TextArea
              value={value}
              onChange={e => handleBodyChange(e.target.value)}
              placeholder={`Enter ${bodyType.toUpperCase()} content...`}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>
        )

      case 'form-data':
      case 'x-www-form-urlencoded':
        return renderFormDataEditor()

      default:
        return null
    }
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
        Request Body
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ marginRight: '8px', fontSize: '12px' }}>Body Type:</span>
        <Select
          value={bodyType}
          onChange={handleBodyTypeChange}
          style={{ width: 150 }}
          size="small"
        >
          <Option value="json">JSON</Option>
          <Option value="xml">XML</Option>
          <Option value="text">Text</Option>
          <Option value="form-data">Form Data</Option>
          <Option value="x-www-form-urlencoded">x-www-form-urlencoded</Option>
        </Select>
      </div>

      {renderBodyInput()}
    </div>
  )
}
