import React, { useState } from 'react'
import { Button, Modal, Form, Input, Space, Empty, Popconfirm } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons'
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
  const {
    collections,
    addCollection,
    updateCollection,
    removeCollection,
    reorderRequestsInCollection,
    updateRequestInCollection,
    removeRequestFromCollection,
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

  const [form] = Form.useForm()

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

  // 拖拽排序处理函数
  const handleDragEnd = (collectionId: string, result: DropResult) => {
    if (!result.destination) return
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return
    const currentRequestIds = collection.requests.map(r => r.id)
    const [removed] = currentRequestIds.splice(result.source.index, 1)
    currentRequestIds.splice(result.destination.index, 0, removed)
    reorderRequestsInCollection(collectionId, currentRequestIds)
  }

  // 编辑请求
  const handleEditRequest = (request: HttpRequest) => {
    setEditingRequest(request)
    setIsEditRequestModalVisible(true)
    requestForm.setFieldsValue({
      name: request.name,
      method: request.method,
      url: request.url,
    })
  }

  // 保存请求编辑
  const handleSaveRequest = async () => {
    try {
      const values = await requestForm.validateFields()
      if (editingRequest) {
        // 找到请求所在的集合
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

  // 删除请求
  const handleDeleteRequest = (collectionId: string, requestId: string) => {
    console.log('handleDeleteRequest', collectionId, requestId)
    removeRequestFromCollection(collectionId, requestId)
  }

  // 选择请求
  const handleSelectRequest = (request: HttpRequest, collectionId: string) => {
    onSelectRequest(request, collectionId)
  }

  // 编辑集合
  const handleEditCollection = (collection: Collection) => {
    setEditingCollectionForEdit(collection)
    setIsEditCollectionModalVisible(true)
    collectionForm.setFieldsValue({
      name: collection.name,
      description: collection.description,
    })
  }

  // 保存集合编辑
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

  // 删除集合
  const handleDeleteCollection = (collectionId: string) => {
    removeCollection(collectionId)
  }

  return (
    <div className="collection-panel">
      <div className="collection-header">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAddCollection}
          >
            New
          </Button>
        </Space>
      </div>

      {collections.length === 0 ? (
        <Empty description="No collections yet" style={{ marginTop: 40 }} />
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
                    title="编辑集合"
                  />
                  <Popconfirm
                    title="确定要删除这个集合吗？"
                    description="删除后无法恢复，集合中的所有请求也会被删除。"
                    onConfirm={e => {
                      e?.stopPropagation()
                      handleDeleteCollection(collection.id)
                    }}
                    okText="确定"
                    cancelText="取消"
                    okType="danger"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={e => e.stopPropagation()}
                      style={{ padding: '0 4px' }}
                      title="删除集合"
                    />
                  </Popconfirm>
                </Space>
              </div>
              {/* 拖拽排序列表 */}
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
                                />
                                <Popconfirm
                                  title="确定要删除这个请求吗？"
                                  onConfirm={e => {
                                    e?.stopPropagation()
                                    handleDeleteRequest(
                                      collection.id,
                                      request.id
                                    )
                                  }}
                                  okText="确定"
                                  cancelText="取消"
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={e => e.stopPropagation()}
                                    style={{ padding: '0 4px' }}
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

      {/* 添加/编辑集合模态框 */}
      <Modal
        title={editingCollection ? '编辑集合' : '添加集合'}
        open={isAddModalVisible}
        onOk={handleSaveCollection}
        onCancel={() => {
          setIsAddModalVisible(false)
          form.resetFields()
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="集合名称"
            rules={[{ required: true, message: '请输入集合名称' }]}
          >
            <Input placeholder="例如: API测试集合" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑请求模态框 */}
      <Modal
        title="编辑请求"
        open={isEditRequestModalVisible}
        onOk={handleSaveRequest}
        onCancel={() => {
          setIsEditRequestModalVisible(false)
          requestForm.resetFields()
        }}
        width={500}
      >
        <Form form={requestForm} layout="vertical">
          <Form.Item
            name="name"
            label="请求名称"
            rules={[{ required: true, message: '请输入请求名称' }]}
          >
            <Input placeholder="例如: 获取用户信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑集合模态框 */}
      <Modal
        title="编辑集合"
        open={isEditCollectionModalVisible}
        onOk={handleSaveCollectionEdit}
        onCancel={() => {
          setIsEditCollectionModalVisible(false)
          collectionForm.resetFields()
        }}
        width={500}
      >
        <Form form={collectionForm} layout="vertical">
          <Form.Item
            name="name"
            label="集合名称"
            rules={[{ required: true, message: '请输入集合名称' }]}
          >
            <Input placeholder="例如: API测试集合" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
