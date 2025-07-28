import React, { useState } from 'react'
import { Input, Select, Space, Button } from 'antd'
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import type { HttpResponse } from '@/types'

const { TextArea } = Input
const { Option } = Select

interface ResponseBodyProps {
  response: HttpResponse
}

type ViewMode = 'preview' | 'raw'

export const ResponseBody: React.FC<ResponseBodyProps> = ({ response }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('preview')

  const detectContentType = (): string => {
    const contentType =
      response.headers['content-type'] || response.headers['Content-Type'] || ''

    if (contentType.includes('application/json')) return 'json'
    if (
      contentType.includes('application/xml') ||
      contentType.includes('text/xml')
    )
      return 'xml'
    if (contentType.includes('text/html')) return 'html'
    if (
      contentType.includes('text/markdown') ||
      contentType.includes('text/x-markdown')
    )
      return 'markdown'
    if (contentType.includes('text/')) return 'text'
    return 'text'
  }

  const formatResponse = (): string => {
    const contentType = detectContentType()

    if (contentType === 'json') {
      try {
        // 尝试解析JSON并格式化
        const parsed = JSON.parse(response.body)
        return JSON.stringify(parsed, null, 2)
      } catch {
        // 如果解析失败，返回原始内容
        return response.body
      }
    }

    if (contentType === 'xml') {
      // 对于XML，尝试格式化（简单的缩进）
      return response.body.replace(/>\s*</g, '>\n<').replace(/^\s*/gm, '  ')
    }

    // 对于其他内容类型，返回原始内容
    return response.body
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response.body)
  }

  const downloadResponse = () => {
    const blob = new Blob([response.body], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'response.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderBody = () => {
    switch (viewMode) {
      case 'preview':
        const contentType = detectContentType()

        // JSON 和 XML 使用格式化显示
        if (contentType === 'json' || contentType === 'xml') {
          return (
            <TextArea
              value={formatResponse()}
              readOnly
              rows={12}
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                backgroundColor: '#f5f5f5',
              }}
            />
          )
        }

        // HTML 渲染 - 使用iframe
        if (contentType === 'html') {
          return (
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                overflow: 'auto',
                resize: 'vertical',
                minHeight: '400px',
                width: '100%',
              }}
            >
              <iframe
                srcDoc={response.body}
                sandbox="allow-scripts allow-same-origin"
                title="HTML Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          )
        }

        // Markdown 渲染（简单实现）
        if (contentType === 'markdown') {
          // 简单的 markdown 渲染
          const renderedContent = response.body
            .replace(
              /^### (.*$)/gim,
              '<h3 style="margin: 16px 0 8px 0; font-size: 18px; font-weight: 600; color: #333;">$1</h3>'
            )
            .replace(
              /^## (.*$)/gim,
              '<h2 style="margin: 20px 0 12px 0; font-size: 22px; font-weight: 600; color: #333;">$1</h2>'
            )
            .replace(
              /^# (.*$)/gim,
              '<h1 style="margin: 24px 0 16px 0; font-size: 26px; font-weight: 600; color: #333;">$1</h1>'
            )
            .replace(
              /\*\*(.*)\*\*/gim,
              '<strong style="font-weight: 600;">$1</strong>'
            )
            .replace(/\*(.*)\*/gim, '<em style="font-style: italic;">$1</em>')
            .replace(
              /`(.*)`/gim,
              '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;">$1</code>'
            )
            .replace(/\n/gim, '<br>')

          return (
            <div
              className="markdown-preview-container"
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#fff',
                minHeight: '200px',
                maxHeight: '600px',
                overflow: 'auto',
                // 样式隔离
                all: 'initial',
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#333',
                boxSizing: 'border-box',
              }}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )
        }

        // 其他类型使用原始格式化
        return (
          <TextArea
            value={formatResponse()}
            readOnly
            rows={12}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f5f5f5',
            }}
          />
        )

      case 'raw':
        return (
          <TextArea
            value={response.body}
            readOnly
            rows={12}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f5f5f5',
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="response-body">
      {/* 工具栏 */}
      <div className="response-toolbar">
        <Space>
          <span>View:</span>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
            size="small"
          >
            <Option value="preview">Preview</Option>
            <Option value="raw">Raw</Option>
          </Select>
        </Space>

        <Space>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={copyToClipboard}
          >
            Copy
          </Button>
          <Button
            icon={<DownloadOutlined />}
            size="small"
            onClick={downloadResponse}
          >
            Download
          </Button>
        </Space>
      </div>

      {/* 响应内容 */}
      <div className="response-content-area">{renderBody()}</div>
    </div>
  )
}
