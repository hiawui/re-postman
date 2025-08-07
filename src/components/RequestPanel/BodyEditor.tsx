import React, { useState, useEffect, useRef } from 'react'
import { Input, Select, Row, Col, Button } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
const { TextArea } = Input
const { Option } = Select

interface FormDataItem {
  key: string
  value: string
  type: 'text' | 'file'
  file?: File | null
  fileName?: string
}

interface BodyEditorProps {
  value: string
  onChange: (body: string) => void
  onBodyTypeChange?: (bodyType: string) => void
  onFormDataChange?: (formData: FormDataItem[]) => void
  formData?: FormDataItem[]
  bodyType?: BodyType // 新增：从外部传入的 bodyType
}

type BodyType = 'json' | 'xml' | 'text' | 'form-data' | 'x-www-form-urlencoded'

export const BodyEditor: React.FC<BodyEditorProps> = ({
  value,
  onChange,
  onBodyTypeChange,
  onFormDataChange,
  formData: externalFormData,
  bodyType: externalBodyType, // 新增：接收外部传入的 bodyType
}) => {
  const { t } = useTranslation()
  const [bodyType, setBodyType] = useState<BodyType>(externalBodyType || 'json')
  const [formData, setFormData] = useState<FormDataItem[]>([
    { key: '', value: '', type: 'text' },
  ])
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 当外部传入的 bodyType 改变时，更新内部状态
  useEffect(() => {
    if (externalBodyType && externalBodyType !== bodyType) {
      setBodyType(externalBodyType)
    }
  }, [externalBodyType, bodyType])

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
          type: 'text', // 默认为 text，对于 x-www-form-urlencoded 总是 text
        })
      }
    })

    return items.length > 0 ? items : [{ key: '', value: '', type: 'text' }]
  }

  // 当 value 或 bodyType 改变时，更新 formData
  useEffect(() => {
    if (bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') {
      let finalFormData: FormDataItem[]

      // 如果有外部传入的 formData，优先使用
      if (externalFormData && externalFormData.length > 0) {
        finalFormData = [...externalFormData]
      } else {
        finalFormData = parseFormDataFromString(value)
      }

      // 对于 x-www-form-urlencoded，强制所有项的类型为 text
      if (bodyType === 'x-www-form-urlencoded') {
        finalFormData.forEach(item => {
          item.type = 'text'
        })
      }

      // 检查最后一行是否为空行，如果不是则添加空行
      const lastItem = finalFormData[finalFormData.length - 1]
      if (
        lastItem &&
        (lastItem.key.trim() !== '' || lastItem.value.trim() !== '')
      ) {
        finalFormData.push({ key: '', value: '', type: 'text' })
      }

      setFormData(finalFormData)
    }
  }, [value, bodyType, externalFormData])

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
        .map(item => {
          if (item.type === 'file' && item.file) {
            return `${item.key}=${item.fileName || 'file'}`
          }
          return `${item.key}=${item.value}`
        })
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

    // 对于 x-www-form-urlencoded，强制类型为 text
    if (bodyType === 'x-www-form-urlencoded') {
      newFormData[index].type = 'text'
    }

    setFormData(newFormData)
    onFormDataChange?.(newFormData)

    // 转换为字符串并更新
    const formDataString = newFormData
      .filter(item => item.key.trim())
      .map(item => {
        if (item.type === 'file' && item.file) {
          return `${item.key}=${item.fileName || 'file'}`
        }
        return `${item.key}=${item.value}`
      })
      .join('&')
    onChange(formDataString)
  }

  const handleFileChange = (index: number, file: File | null) => {
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      file: file,
      fileName: file ? file.name : '',
      value: file ? file.name : '',
    }

    setFormData(newFormData)
    onFormDataChange?.(newFormData)

    // 转换为字符串并更新
    const formDataString = newFormData
      .filter(item => item.key.trim())
      .map(item => {
        if (item.type === 'file' && item.file) {
          return `${item.key}=${item.fileName || 'file'}`
        }
        return `${item.key}=${item.value}`
      })
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
    onFormDataChange?.(newFormData)

    // 转换为字符串并更新
    const formDataString = newFormData
      .filter(item => item.key.trim())
      .map(item => {
        if (item.type === 'file' && item.file) {
          return `${item.key}=${item.fileName || 'file'}`
        }
        return `${item.key}=${item.value}`
      })
      .join('&')
    onChange(formDataString)
  }

  const renderFileInput = (item: FormDataItem, index: number) => {
    if (item.type === 'file') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => fileInputRefs.current[index]?.click()}
            style={{ fontSize: '12px' }}
          >
            {t('request.selectFile')}
          </Button>
          {item.fileName && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              {item.fileName}
            </span>
          )}
          <input
            ref={el => (fileInputRefs.current[index] = el)}
            type="file"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0] || null
              handleFileChange(index, file)
            }}
          />
        </div>
      )
    }
    return (
      <Input
        placeholder={t('request.value')}
        value={item.value}
        onChange={e => handleFormDataChange(index, 'value', e.target.value)}
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
    )
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
                placeholder={t('request.key')}
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
            <Col flex="250px">{renderFileInput(item, index)}</Col>
            {bodyType === 'form-data' && (
              <Col flex="none">
                <Select
                  value={item.type}
                  onChange={value => handleFormDataChange(index, 'type', value)}
                  size="small"
                  style={{ width: 80, fontSize: '12px' }}
                >
                  <Option value="text">{t('request.text')}</Option>
                  <Option value="file">{t('request.file')}</Option>
                </Select>
              </Col>
            )}
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
              <span style={{ fontSize: '12px' }}>
                {t('request.bodyContent')}
              </span>
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
                  {t('request.formatJson')}
                </button>
              )}
            </div>
            <TextArea
              value={value}
              onChange={e => handleBodyChange(e.target.value)}
              placeholder={
                bodyType === 'json'
                  ? t('request.enterJsonContent')
                  : bodyType === 'xml'
                    ? t('request.enterXmlContent')
                    : t('request.enterTextContent')
              }
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
        {t('request.requestBody')}
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ marginRight: '8px', fontSize: '12px' }}>
          {t('common.type')}:
        </span>
        <Select
          value={bodyType}
          onChange={handleBodyTypeChange}
          style={{ width: 150 }}
          size="small"
        >
          <Option value="json">{t('bodyTypes.json')}</Option>
          <Option value="xml">{t('bodyTypes.xml')}</Option>
          <Option value="text">{t('bodyTypes.raw')}</Option>
          <Option value="form-data">{t('bodyTypes.formData')}</Option>
          <Option value="x-www-form-urlencoded">
            {t('bodyTypes.xWwwFormUrlencoded')}
          </Option>
        </Select>
      </div>

      {renderBodyInput()}
    </div>
  )
}
