import React, { useState } from 'react'
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  Collapse,
} from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { useAppStore } from '@/stores/appStore'
import { VariableReplacer } from '@/utils/variableReplacer'
import type { Environment } from '@/types'
const { Text } = Typography

interface EnvironmentPanelProps {
  visible: boolean
  onClose: () => void
}

export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  visible,
  onClose,
}) => {
  const {
    environments,
    activeEnvironmentIds,
    addEnvironment,
    removeEnvironment,
    activateEnvironment,
    deactivateEnvironment,
    updateEnvironment,
  } = useAppStore()
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [editingEnvironment, setEditingEnvironment] =
    useState<Environment | null>(null)
  const [showMergedVariables, setShowMergedVariables] = useState(false)
  const [form] = Form.useForm()

  const handleAddEnvironment = () => {
    setIsAddModalVisible(true)
    setEditingEnvironment(null)
    form.resetFields()
  }

  const handleEditEnvironment = (environment: Environment) => {
    setEditingEnvironment(environment)
    setIsAddModalVisible(true)
    form.setFieldsValue({
      name: environment.name,
      variables: Object.entries(environment.variables).map(([key, value]) => ({
        key,
        value,
      })),
    })
  }

  const handleSaveEnvironment = async () => {
    try {
      const values = await form.validateFields()
      const variables =
        values.variables?.reduce(
          (
            acc: Record<string, string>,
            item: { key: string; value: string }
          ) => {
            if (item.key && item.value) {
              acc[item.key] = item.value
            }
            return acc
          },
          {}
        ) || {}

      if (editingEnvironment) {
        updateEnvironment(editingEnvironment.id, {
          name: values.name,
          variables,
        })
      } else {
        addEnvironment({
          name: values.name,
          variables,
          isActive: false,
        })
      }

      setIsAddModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  const handleDeleteEnvironment = (environmentId: string) => {
    removeEnvironment(environmentId)
  }

  const handleActivate = (environmentId: string) => {
    activateEnvironment(environmentId)
  }

  const handleDeactivate = (environmentId: string) => {
    deactivateEnvironment(environmentId)
  }

  // 获取启用的环境
  const getActiveEnvironments = () => {
    return activeEnvironmentIds
      .map(id => environments.find(e => e.id === id))
      .filter(Boolean) as Environment[]
  }

  // 计算合并后的变量
  const getMergedVariables = () => {
    const activeEnvs = getActiveEnvironments()
    return VariableReplacer.mergeEnvironmentVariables(activeEnvs)
  }

  // 获取变量的来源环境
  const getVariableSource = (variableName: string) => {
    const activeEnvs = getActiveEnvironments()
    for (let i = activeEnvs.length - 1; i >= 0; i--) {
      if (activeEnvs[i].variables[variableName]) {
        return activeEnvs[i]
      }
    }
    return null
  }

  const columns = [
    {
      title: '环境名称',
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: Environment) => (
        <Space>
          <Text strong={activeEnvironmentIds.includes(record.id)}>
            {record.name}
          </Text>
          {activeEnvironmentIds.includes(record.id) && (
            <Tag color="green">已启用</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '变量数量',
      key: 'variableCount',
      render: (_text: string, record: Environment) => (
        <Text>{Object.keys(record.variables).length} 个</Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_text: string, record: Environment) => (
        <Space>
          <Button size="small" onClick={() => handleEditEnvironment(record)}>
            编辑
          </Button>
          {!activeEnvironmentIds.includes(record.id) ? (
            <Button
              size="small"
              type="primary"
              onClick={() => handleActivate(record.id)}
            >
              启用
            </Button>
          ) : (
            <Button
              size="small"
              type="default"
              danger
              onClick={() => handleDeactivate(record.id)}
            >
              停用
            </Button>
          )}
          <Button
            size="small"
            danger
            onClick={() => handleDeleteEnvironment(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title="环境变量管理"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text>管理不同环境的变量配置</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                启用环境：点击"启用"按钮将环境应用到请求中，后面的环境会覆盖前面的环境
              </Text>
            </div>
            {activeEnvironmentIds.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">
                  已启用环境:{' '}
                  {activeEnvironmentIds
                    .map(id => environments.find(e => e.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </div>
            )}
          </div>
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setShowMergedVariables(!showMergedVariables)}
            >
              {showMergedVariables ? '隐藏' : '预览'}合并变量
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEnvironment}
            >
              添加环境
            </Button>
          </Space>
        </div>

        <Table
          dataSource={environments}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />

        {/* 合并变量预览 */}
        {showMergedVariables && activeEnvironmentIds.length > 0 && (
          <Collapse defaultActiveKey={['merged']}>
            <Collapse.Panel
              header="已启用环境的合并变量（按启用顺序排序）"
              key="merged"
            >
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {Object.entries(getMergedVariables()).map(([key, value]) => {
                  const source = getVariableSource(key)
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Text strong>{key}</Text>
                        <br />
                        <Text type="secondary">{value}</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Tag color="blue">来自: {source?.name || '未知'}</Tag>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Collapse.Panel>
          </Collapse>
        )}

        {/* 添加/编辑环境模态框 */}
        <Modal
          title={editingEnvironment ? '编辑环境' : '添加环境'}
          open={isAddModalVisible}
          onOk={handleSaveEnvironment}
          onCancel={() => {
            setIsAddModalVisible(false)
            form.resetFields()
          }}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="环境名称"
              rules={[{ required: true, message: '请输入环境名称' }]}
            >
              <Input placeholder="例如: 开发环境" />
            </Form.Item>

            <Form.List name="variables">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, message: '请输入变量名' }]}
                      >
                        <Input placeholder="变量名" style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: '请输入变量值' }]}
                      >
                        <Input placeholder="变量值" style={{ width: 200 }} />
                      </Form.Item>
                      <Button onClick={() => remove(name)} danger>
                        删除
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加变量
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </Space>
    </Modal>
  )
}
