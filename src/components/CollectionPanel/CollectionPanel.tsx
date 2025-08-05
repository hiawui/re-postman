import React, { useState } from 'react'
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Empty,
  Popconfirm,
  Upload,
  message,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/appStore'
import type { Collection, HttpRequest } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

interface CollectionPanelProps {
  onSelectRequest: (request: HttpRequest, collectionId?: string) => void
  selectedRequestId?: string
}

export const CollectionPanel: React.FC<CollectionPanelProps> = ({
  onSelectRequest,
  selectedRequestId,
}) => {
  const { t } = useTranslation()
  const {
    collections,
    addCollection,
    updateCollection,
    removeCollection,
    reorderRequestsInCollection,
    updateRequestInCollection,
    removeRequestFromCollection,
    exportCollections,
    importCollections,
  } = useAppStore()
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  )
  const [isEditRequestModalVisible, setIsEditRequestModalVisible] =
    useState(false)
  const [editingRequest, setEditingRequest] = useState<HttpRequest | null>(null)
  const [requestForm] = Form.useForm()
  const [isEditCollectionModalVisible, setIsEditCollectionModalVisible] =
    useState(false)
  const [editingCollectionForEdit, setEditingCollectionForEdit] =
    useState<Collection | null>(null)
  const [collectionForm] = Form.useForm()
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [importForm] = Form.useForm()

  const [form] = Form.useForm()

  // 导出集合
  const handleExportCollections = () => {
    try {
      const jsonData = exportCollections()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `collections-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success(t('collections.exportSuccess'))
    } catch (error) {
      message.error(t('collections.exportError'))
    }
  }

  // 导入集合
  const handleImportCollections = async () => {
    try {
      const values = await importForm.validateFields()
      const result = importCollections(values.jsonData)

      if (result.success) {
        message.success(result.message)
        setIsImportModalVisible(false)
        importForm.resetFields()
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error(t('collections.importError'))
    }
  }

  // 处理文件上传
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const content = e.target?.result as string
        importForm.setFieldsValue({ jsonData: content })
        setIsImportModalVisible(true)
      } catch (error) {
        message.error(t('collections.fileReadError'))
      }
    }
    reader.readAsText(file)
  }

  const handleAddCollection = () => {
    setIsAddModalVisible(true)
    setEditingCollection(null)
    form.resetFields()
  }

  const handleSaveCollection = async () => {
    try {
      const values = await form.validateFields()

      if (editingCollection) {
        updateCollection(editingCollection.id, {
          name: values.name,
          description: values.description,
        })
      } else {
        addCollection({
          name: values.name,
          description: values.description,
          requests: [],
          folders: [],
        })
      }

      setIsAddModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = (collectionId: string, result: DropResult) => {
    if (!result.destination) return
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return
    const currentRequestIds = collection.requests.map(r => r.id)
    const [removed] = currentRequestIds.splice(result.source.index, 1)
    currentRequestIds.splice(result.destination.index, 0, removed)
    reorderRequestsInCollection(collectionId, currentRequestIds)
  }

  // Edit request
  const handleEditRequest = (request: HttpRequest) => {
    setEditingRequest(request)
    setIsEditRequestModalVisible(true)
    requestForm.setFieldsValue({
      name: request.name,
      method: request.method,
      url: request.url,
    })
  }

  // Save request edit
  const handleSaveRequest = async () => {
    try {
      const values = await requestForm.validateFields()
      if (editingRequest) {
        // Find the collection containing the request
        const collection = collections.find(c =>
          c.requests.some(r => r.id === editingRequest.id)
        )
        if (collection) {
          updateRequestInCollection(collection.id, editingRequest.id, {
            name: values.name,
            method: values.method,
            url: values.url,
          })
        }
      }
      setIsEditRequestModalVisible(false)
      requestForm.resetFields()
    } catch (error) {
      console.error('Request form validation failed:', error)
    }
  }

  // Delete request
  const handleDeleteRequest = (collectionId: string, requestId: string) => {
    removeRequestFromCollection(collectionId, requestId)
  }

  // Select request
  const handleSelectRequest = (request: HttpRequest, collectionId: string) => {
    onSelectRequest(request, collectionId)
  }

  // Edit collection
  const handleEditCollection = (collection: Collection) => {
    setEditingCollectionForEdit(collection)
    setIsEditCollectionModalVisible(true)
    collectionForm.setFieldsValue({
      name: collection.name,
      description: collection.description,
    })
  }

  // Save collection edit
  const handleSaveCollectionEdit = async () => {
    try {
      const values = await collectionForm.validateFields()
      if (editingCollectionForEdit) {
        updateCollection(editingCollectionForEdit.id, {
          name: values.name,
          description: values.description,
        })
      }
      setIsEditCollectionModalVisible(false)
      collectionForm.resetFields()
    } catch (error) {
      console.error('Collection form validation failed:', error)
    }
  }

  // Delete collection
  const handleDeleteCollection = (collectionId: string) => {
    removeCollection(collectionId)
  }

  return (
    <div className="collection-panel">
      <div
        className="collection-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={handleAddCollection}
        >
          {t('collections.newCollection')}
        </Button>
        <Space>
          <Popconfirm
            title={t('collections.exportCollectionsConfirm')}
            description={t('collections.exportCollectionsDescription')}
            onConfirm={handleExportCollections}
            okText={t('common.ok')}
            cancelText={t('common.cancel')}
          >
            <Button
              type="default"
              icon={<ExportOutlined />}
              size="small"
              style={{
                color: '#666',
                borderColor: '#d9d9d9',
                backgroundColor: '#fafafa',
              }}
              title={t('collections.exportCollectionsTooltip')}
            />
          </Popconfirm>
          <Button
            type="default"
            icon={<ImportOutlined />}
            size="small"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
            title={t('collections.importCollectionsTooltip')}
            onClick={() => setIsImportModalVisible(true)}
          />
        </Space>
      </div>

      {collections.length === 0 ? (
        <Empty
          description={t('collections.noCollections')}
          style={{ marginTop: 40 }}
        />
      ) : (
        <div className="collections-list">
          {collections.map(collection => (
            <div key={collection.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                <span>{collection.name}</span>
                <Space size="small">
                  <Button
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={e => {
                      e.stopPropagation()
                      handleEditCollection(collection)
                    }}
                    style={{ padding: '0 4px' }}
                    title={t('collections.editCollectionTooltip')}
                  />
                  <Popconfirm
                    title={t('collections.deleteCollectionConfirm')}
                    description={t('collections.deleteCollectionDescription')}
                    onConfirm={e => {
                      e?.stopPropagation()
                      handleDeleteCollection(collection.id)
                    }}
                    okText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    okType="danger"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={e => e.stopPropagation()}
                      style={{ padding: '0 4px' }}
                      title={t('collections.deleteCollectionTooltip')}
                    />
                  </Popconfirm>
                </Space>
              </div>
              {/* Drag and drop reorderable list */}
              <DragDropContext
                onDragEnd={result => handleDragEnd(collection.id, result)}
              >
                <Droppable droppableId={`droppable-${collection.id}`}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {collection.requests.map((request, idx) => (
                        <Draggable
                          key={request.id}
                          draggableId={request.id}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: snapshot.isDragging
                                  ? '#e6f7ff'
                                  : selectedRequestId === request.id
                                    ? '#e6f7ff'
                                    : '#fff',
                                border:
                                  selectedRequestId === request.id
                                    ? '1px solid #1890ff'
                                    : '1px solid #f0f0f0',
                                borderRadius: 4,
                                marginBottom: 4,
                                padding: '4px 8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                ...provided.draggableProps.style,
                              }}
                              onClick={() =>
                                handleSelectRequest(request, collection.id)
                              }
                              onMouseEnter={e => {
                                if (
                                  !snapshot.isDragging &&
                                  selectedRequestId !== request.id
                                ) {
                                  e.currentTarget.style.backgroundColor =
                                    '#f5f5f5'
                                }
                              }}
                              onMouseLeave={e => {
                                if (
                                  !snapshot.isDragging &&
                                  selectedRequestId !== request.id
                                ) {
                                  e.currentTarget.style.backgroundColor = '#fff'
                                }
                              }}
                            >
                              <span style={{ flex: 1 }}>{request.name}</span>
                              <Space size="small">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleEditRequest(request)
                                  }}
                                  style={{ padding: '0 4px' }}
                                  title={t('collections.editRequestTooltip')}
                                />
                                <Popconfirm
                                  title={t('collections.deleteRequestConfirm')}
                                  onConfirm={e => {
                                    e?.stopPropagation()
                                    handleDeleteRequest(
                                      collection.id,
                                      request.id
                                    )
                                  }}
                                  okText={t('common.delete')}
                                  cancelText={t('common.cancel')}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={e => e.stopPropagation()}
                                    style={{ padding: '0 4px' }}
                                    title={t(
                                      'collections.deleteRequestTooltip'
                                    )}
                                  />
                                </Popconfirm>
                              </Space>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Collection Modal */}
      <Modal
        title={
          editingCollection
            ? t('collections.editCollection')
            : t('collections.newCollection')
        }
        open={isAddModalVisible}
        onOk={handleSaveCollection}
        onCancel={() => {
          setIsAddModalVisible(false)
          form.resetFields()
        }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('collections.collectionName')}
            rules={[{ required: true, message: t('errors.requiredField') }]}
          >
            <Input placeholder={t('collections.collectionNamePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Request Modal */}
      <Modal
        title={t('collections.editRequest')}
        open={isEditRequestModalVisible}
        onOk={handleSaveRequest}
        onCancel={() => {
          setIsEditRequestModalVisible(false)
          requestForm.resetFields()
        }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        width={500}
      >
        <Form form={requestForm} layout="vertical">
          <Form.Item
            name="name"
            label={t('request.requestName')}
            rules={[{ required: true, message: t('errors.requiredField') }]}
          >
            <Input placeholder={t('collections.requestNamePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal
        title={t('collections.editCollection')}
        open={isEditCollectionModalVisible}
        onOk={handleSaveCollectionEdit}
        onCancel={() => {
          setIsEditCollectionModalVisible(false)
          collectionForm.resetFields()
        }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        width={500}
      >
        <Form form={collectionForm} layout="vertical">
          <Form.Item
            name="name"
            label={t('collections.collectionName')}
            rules={[{ required: true, message: t('errors.requiredField') }]}
          >
            <Input placeholder={t('collections.collectionNamePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Collections Modal */}
      <Modal
        title={t('collections.importCollections')}
        open={isImportModalVisible}
        onOk={handleImportCollections}
        onCancel={() => {
          setIsImportModalVisible(false)
          importForm.resetFields()
        }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        width={600}
      >
        <Form form={importForm} layout="vertical">
          <Form.Item
            label={t('collections.importMethod')}
            style={{ marginBottom: 16 }}
          >
            <Space>
              <Upload
                beforeUpload={file => {
                  handleFileUpload(file)
                  return false
                }}
                showUploadList={false}
                accept=".json"
              >
                <Button icon={<ImportOutlined />}>
                  {t('collections.uploadFile')}
                </Button>
              </Upload>
              <span style={{ color: '#666' }}>
                {t('collections.orPasteJson')}
              </span>
            </Space>
          </Form.Item>
          <Form.Item
            name="jsonData"
            label={t('collections.importJsonData')}
            rules={[{ required: true, message: t('errors.requiredField') }]}
          >
            <Input.TextArea
              rows={12}
              placeholder={t('collections.importJsonDataPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
