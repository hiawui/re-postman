import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  message,
  Input,
} from 'antd'
import {
  SendOutlined,
  EnvironmentOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { UrlInput } from './UrlInput'
import { UrlDisplay } from './UrlDisplay'
import { MethodSelector } from './MethodSelector'
import { ParamsEditor } from './ParamsEditor'
import { HeadersEditor } from './HeadersEditor'
import { BodyEditor } from './BodyEditor'

import { useAppStore } from '@/stores/appStore'
import type { Tab, Environment, HttpMethod, BodyType } from '@/types'

interface RequestPanelProps {
  tab: Tab
}

export const RequestPanel: React.FC<RequestPanelProps> = ({ tab }) => {
  const { t } = useTranslation()
  const {
    updateRequest,
    sendRequest,
    environments,
    activeEnvironmentIds,
    collections,
    addRequestToCollection,
    updateRequestInCollection,
    updateTab,
  } = useAppStore()

  const [showParams, setShowParams] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [isAddToCollectionModalVisible, setIsAddToCollectionModalVisible] =
    useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [requestName, setRequestName] = useState<string>('')

  const handleUrlChange = (url: string) => {
    updateRequest(tab.id, { url })
  }

  const handleMethodChange = (method: string) => {
    updateRequest(tab.id, { method: method as HttpMethod })
  }

  const handleParamsChange = (params: [string, string][]) => {
    updateRequest(tab.id, { params })
  }

  const handleHeadersChange = (headers: [string, string][]) => {
    updateRequest(tab.id, { headers })
  }

  const handleBodyChange = (body: string) => {
    updateRequest(tab.id, { body })
  }

  const handleBodyTypeChange = (bodyType: string) => {
    updateRequest(tab.id, { bodyType: bodyType as BodyType })
  }

  const handleSendRequest = () => {
    sendRequest(tab.id)
  }

  const handleAddToCollection = () => {
    if (collections.length === 0) {
      message.warning(t('request.createCollectionFirst'))
      return
    }
    setRequestName(tab.request.name) // 默认使用当前请求名称
    setIsAddToCollectionModalVisible(true)
  }

  const handleSaveToCollection = () => {
    if (!selectedCollectionId) {
      message.error(t('request.selectCollectionError'))
      return
    }

    if (!requestName.trim()) {
      message.error(t('request.enterRequestNameError'))
      return
    }
    const newRequestName = requestName.trim()

    // 创建带有新名称的请求副本
    const requestWithNewName = {
      ...tab.request,
      name: newRequestName,
    }

    const addedRequest = addRequestToCollection(
      selectedCollectionId,
      requestWithNewName
    )

    // 记住添加到的 collection 和新生成的 request.id，供后续 Save 按钮使用
    updateTab(tab.id, {
      title: newRequestName,
      sourceCollectionId: selectedCollectionId,
      sourceRequestId: addedRequest.id,
    })

    updateRequest(tab.id, { id: addedRequest.id, name: newRequestName })

    message.success(t('request.requestAddedToCollection'))
    setIsAddToCollectionModalVisible(false)
    setSelectedCollectionId('')
    setRequestName('')
  }

  // 保存到 collection（更新现有请求）
  const handleSaveToExistingCollection = () => {
    if (tab.sourceCollectionId && tab.sourceRequestId) {
      updateRequestInCollection(tab.sourceCollectionId, tab.sourceRequestId, {
        name: tab.request.name,
        method: tab.request.method,
        url: tab.request.url,
        headers: tab.request.headers,
        params: tab.request.params,
        body: tab.request.body,
        bodyType: tab.request.bodyType,
      })
      message.success(t('request.requestSavedToCollection'))
    }
  }

  const activeEnvironments = (activeEnvironmentIds || [])
    .map(id => environments.find(env => env.id === id))
    .filter(Boolean) as Environment[]

  return (
    <div className="request-panel">
      <Card
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{t('request.requestTitle')}</span>
            {activeEnvironments.length > 0 && (
              <Tag color="blue" icon={<EnvironmentOutlined />}>
                {activeEnvironments
                  .map(env => env?.name)
                  .filter(Boolean)
                  .join(', ')}
              </Tag>
            )}
          </div>
        }
        size="small"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 显示完整 URL（包含参数和环境变量）和 Collection 按钮 */}
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <UrlDisplay
                baseUrl={tab.request.url}
                params={tab.request.params || []}
                environments={activeEnvironments}
                color="#52c41a"
              />
            </Col>
            <Col flex="none">
              <Button
                icon={<SaveOutlined />}
                onClick={handleAddToCollection}
                disabled={!tab.request.url || tab.request.url.trim() === ''}
                title={t('request.addToCollection')}
                size="small"
              >
                {t('request.addToCollection')}
              </Button>
            </Col>
            {tab.sourceCollectionId && tab.sourceRequestId && (
              <Col flex="none">
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={handleSaveToExistingCollection}
                  disabled={!tab.request.url || tab.request.url.trim() === ''}
                  title={t('request.saveToCollection')}
                  size="small"
                >
                  {t('request.save')}
                </Button>
              </Col>
            )}
          </Row>

          {/* URL和Method行 */}
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <UrlInput
                baseUrl={tab.request.url}
                params={tab.request.params || []}
                onUrlChange={handleUrlChange}
                onParamsChange={handleParamsChange}
                onSendRequest={handleSendRequest}
              />
            </Col>
            <Col flex="none">
              <MethodSelector
                value={tab.request.method}
                onChange={handleMethodChange}
              />
            </Col>
            <Col flex="none">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendRequest}
                loading={tab.isLoading}
                disabled={
                  !tab.request.url ||
                  tab.request.url.trim() === '' ||
                  tab.isLoading
                }
                style={{ minWidth: '80px' }}
              >
                {tab.isLoading ? t('request.sending') : t('request.send')}
              </Button>
            </Col>
            <Col flex="none">
              <Button
                type={showParams ? 'primary' : 'default'}
                onClick={() => setShowParams((prev: boolean) => !prev)}
                size="small"
                style={{ marginRight: 4 }}
              >
                {t('request.params')}
              </Button>
              <Button
                type={showHeaders ? 'primary' : 'default'}
                onClick={() => setShowHeaders((prev: boolean) => !prev)}
                size="small"
              >
                {t('request.headers')}
              </Button>
            </Col>
          </Row>

          {/* 参数编辑器 */}
          {showParams && (
            <ParamsEditor
              value={tab.request.params || []}
              onChange={handleParamsChange}
            />
          )}

          {/* 请求头编辑器 */}
          {showHeaders && (
            <HeadersEditor
              value={tab.request.headers}
              onChange={handleHeadersChange}
            />
          )}

          {/* 请求体编辑器 */}
          {['POST', 'PUT', 'PATCH'].includes(tab.request.method) && (
            <BodyEditor
              value={tab.request.body || ''}
              onChange={handleBodyChange}
              onBodyTypeChange={handleBodyTypeChange}
            />
          )}
        </Space>
      </Card>

      {/* 添加到 Collection 模态框 */}
      <Modal
        title={t('request.addToCollection')}
        open={isAddToCollectionModalVisible}
        onOk={handleSaveToCollection}
        onCancel={() => {
          setIsAddToCollectionModalVisible(false)
          setSelectedCollectionId('')
          setRequestName('')
        }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <div style={{ marginBottom: 16 }}>
          <p>{t('request.requestNameLabel')}</p>
          <Input
            placeholder={t('request.requestNamePlaceholder')}
            value={requestName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRequestName(e.target.value)
            }
            style={{ marginBottom: 16 }}
          />
          <p>{t('request.selectCollection')}</p>
          <Select
            style={{ width: '100%' }}
            placeholder={t('request.selectCollectionPlaceholder')}
            value={selectedCollectionId}
            onChange={setSelectedCollectionId}
            options={collections.map(collection => ({
              label: collection.name,
              value: collection.id,
            }))}
          />
        </div>
      </Modal>
    </div>
  )
}
