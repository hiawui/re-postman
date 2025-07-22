import React, { useState, useEffect, useRef } from 'react'
import { Input, Row, Col, List, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { searchHeaders, type HttpHeader } from '@/utils/httpHeaders'

interface HeadersEditorProps {
  value: [string, string][]
  onChange: (headers: [string, string][]) => void
}

export const HeadersEditor: React.FC<HeadersEditorProps> = ({
  value,
  onChange,
}) => {
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    () => {
      return value.length > 0
        ? value.map(([key, val]) => ({ key, value: val }))
        : [{ key: '', value: '' }]
    }
  )
  const [suggestions, setSuggestions] = useState<HttpHeader[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [focusedInputIndex, setFocusedInputIndex] = useState<number>(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 当 value 改变时，更新 headers
  useEffect(() => {
    if (value.length > 0) {
      const headersFromValue = value.map(([key, val]) => ({ key, value: val }))

      // 检查最后一行是否为空行，如果不是则添加空行
      const lastHeader = headersFromValue[headersFromValue.length - 1]
      if (
        lastHeader &&
        (lastHeader.key.trim() !== '' || lastHeader.value.trim() !== '')
      ) {
        headersFromValue.push({ key: '', value: '' })
      }

      setHeaders(headersFromValue)
    } else {
      setHeaders([{ key: '', value: '' }])
    }
  }, [value])

  const handleHeaderChange = (
    index: number,
    field: 'key' | 'value',
    newValue: string
  ) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = newValue
    setHeaders(newHeaders)

    // 转换为数组格式并通知父组件
    const headersArray = newHeaders.map(
      header => [header.key.trim(), header.value] as [string, string]
    )

    onChange(headersArray)
  }

  const handleFocus = (index: number) => {
    // 如果焦点在最后一行，自动添加新行
    if (index === headers.length - 1) {
      setHeaders([...headers, { key: '', value: '' }])
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // 如果按下 Enter 键且在最后一行，添加新行
    if (e.key === 'Enter' && index === headers.length - 1) {
      setHeaders([...headers, { key: '', value: '' }])
    }
  }

  const handleHeaderKeyChange = (index: number, value: string) => {
    handleHeaderChange(index, 'key', value)

    // 搜索建议
    const newSuggestions = searchHeaders(value)
    setSuggestions(newSuggestions)
    setActiveIndex(-1)
  }

  const handleHeaderKeyDown = (index: number, e: React.KeyboardEvent) => {
    // 如果按下 Enter 键且在最后一行，添加新行
    if (e.key === 'Enter' && index === headers.length - 1) {
      setHeaders([...headers, { key: '', value: '' }])
    }

    // 处理建议列表的键盘导航
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault()
        handleSuggestionSelect(index, suggestions[activeIndex].name)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSuggestions([])
        setActiveIndex(-1)
      }
    }
  }

  const handleHeaderKeyBlur = () => {
    // 延迟隐藏建议，以便点击建议项
    setTimeout(() => {
      setSuggestions([])
      setActiveIndex(-1)
      setFocusedInputIndex(-1)
    }, 200)
  }

  const handleHeaderKeyFocus = (index: number) => {
    handleFocus(index)

    // 设置当前焦点的输入框索引
    setFocusedInputIndex(index)

    // 重置 activeIndex
    setActiveIndex(-1)
  }

  const handleSuggestionSelect = (index: number, headerName: string) => {
    const newHeaders = [...headers]
    newHeaders[index] = { ...newHeaders[index], key: headerName }
    setHeaders(newHeaders)
    setSuggestions([])
    setActiveIndex(-1)

    // 转换为数组格式并通知父组件
    const headersArray = newHeaders
      .filter(header => header.key.trim())
      .map(header => [header.key.trim(), header.value] as [string, string])

    onChange(headersArray)
  }

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index)
    setHeaders(newHeaders)

    // 转换为数组格式并通知父组件
    const headersArray = newHeaders
      .filter(header => header.key.trim())
      .map(header => [header.key.trim(), header.value] as [string, string])

    onChange(headersArray)
  }

  const renderSuggestions = (inputIndex: number) => (
    <div
      ref={dropdownRef}
      style={{
        maxHeight: '200px',
        overflow: 'auto',
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
      }}
    >
      <List
        size="small"
        dataSource={suggestions}
        renderItem={(header, index) => (
          <List.Item
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              backgroundColor:
                index === activeIndex ? '#e6f7ff' : 'transparent',
              borderBottom: '1px solid #f0f0f0',
              borderLeft:
                index === activeIndex
                  ? '3px solid #1890ff'
                  : '3px solid transparent',
            }}
            onClick={() => {
              if (inputIndex !== -1) {
                handleSuggestionSelect(inputIndex, header.name)
              }
            }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <div
              style={{ fontWeight: 500, fontSize: '12px', color: '#262626' }}
            >
              {header.name}
            </div>
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
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
        Headers
      </div>

      {headers.map((header, index) => (
        <Row key={index} gutter={15} style={{ marginBottom: 8 }} align="middle">
          <Col flex="250px">
            <div style={{ position: 'relative', width: '100%' }}>
              <Input
                placeholder="Header"
                value={header.key}
                onChange={e => handleHeaderKeyChange(index, e.target.value)}
                onFocus={() => handleHeaderKeyFocus(index)}
                onBlur={handleHeaderKeyBlur}
                onKeyDown={e => handleHeaderKeyDown(index, e)}
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
                data-header-index={index}
              />
              {suggestions.length > 0 && focusedInputIndex === index && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                  }}
                >
                  {renderSuggestions(index)}
                </div>
              )}
            </div>
          </Col>
          <Col flex="250px">
            <Input
              placeholder="Value"
              value={header.value}
              onChange={e => handleHeaderChange(index, 'value', e.target.value)}
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
            {index !== headers.length - 1 && (
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => removeHeader(index)}
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
