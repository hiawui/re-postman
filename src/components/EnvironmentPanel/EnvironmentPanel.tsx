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
  Row,
  Col,
  Popconfirm,
} from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    // 设置默认的空环境变量行
    form.setFieldsValue({
      variables: [{ key: '', value: '' }],
    })
  }

  const handleEditEnvironment = (environment: Environment) => {
    setEditingEnvironment(environment)
    setIsAddModalVisible(true)
    const variables = Object.entries(environment.variables).map(
      ([key, value]) => ({
        key,
        value,
      })
    )
    // 确保至少有一行空行
    if (variables.length === 0) {
      variables.push({ key: '', value: '' })
    } else {
      // 检查最后一行是否为空，如果不是则添加空行
      const lastVariable = variables[variables.length - 1]
      if (lastVariable.key.trim() !== '' || lastVariable.value.trim() !== '') {
        variables.push({ key: '', value: '' })
      }
    }
    form.setFieldsValue({
      name: environment.name,
      variables,
    })
  }

  const handleSaveEnvironment = async () => {
    try {
      const values = await form.validateFields()

      // 检查环境名称是否重复
      const isDuplicate = environments.some(env => {
        if (editingEnvironment) {
          // 编辑时排除当前环境
          return env.id !== editingEnvironment.id && env.name === values.name
        } else {
          // 新增时检查所有环境
          return env.name === values.name
        }
      })

      if (isDuplicate) {
        // 显示错误信息
        form.setFields([
          {
            name: 'name',
            errors: [t('environments.duplicateNameError')],
          },
        ])
        return
      }

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

  // 处理环境变量变化
  const handleVariableChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const currentVariables = form.getFieldValue('variables') || []
    const newVariables = [...currentVariables]
    newVariables[index] = { ...newVariables[index], [field]: value }
    form.setFieldValue('variables', newVariables)
  }

  // 处理焦点事件 - 在最后一行获得焦点时添加新行
  const handleVariableFocus = (index: number) => {
    const currentVariables = form.getFieldValue('variables') || []
    if (index === currentVariables.length - 1) {
      form.setFieldValue('variables', [
        ...currentVariables,
        { key: '', value: '' },
      ])
    }
  }

  // 删除环境变量
  const handleRemoveVariable = (index: number) => {
    const currentVariables = form.getFieldValue('variables') || []
    const newVariables = currentVariables.filter(
      (_: any, i: number) => i !== index
    )
    form.setFieldValue('variables', newVariables)
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
      title: t('environments.environmentName'),
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: Environment) => (
        <Space>
          <Text strong={activeEnvironmentIds.includes(record.id)}>
            {record.name}
          </Text>
          {activeEnvironmentIds.includes(record.id) && (
            <Tag color="green">{t('environments.enabled')}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('environments.variableCount'),
      key: 'variableCount',
      render: (_text: string, record: Environment) => (
        <Text>
          {Object.keys(record.variables).length} {t('environments.variables')}
        </Text>
      ),
    },
    {
      title: t('environments.actions'),
      key: 'actions',
      render: (_text: string, record: Environment) => (
        <Space>
          <Button size="small" onClick={() => handleEditEnvironment(record)}>
            {t('common.edit')}
          </Button>
          {!activeEnvironmentIds.includes(record.id) ? (
            <Button
              size="small"
              type="primary"
              onClick={() => handleActivate(record.id)}
            >
              {t('environments.enable')}
            </Button>
          ) : (
            <Button
              size="small"
              type="default"
              danger
              onClick={() => handleDeactivate(record.id)}
            >
              {t('environments.disable')}
            </Button>
          )}
          <Popconfirm
            title={t('environments.deleteEnvironmentConfirm')}
            description={t('environments.deleteEnvironmentDescription')}
            onConfirm={() => handleDeleteEnvironment(record.id)}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okType="danger"
          >
            <Button size="small" danger>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Modal
      title={t('environments.environmentManagement')}
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
            <Text>{t('environments.manageVariables')}</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                {t('environments.enableEnvironment')}
              </Text>
            </div>
            {activeEnvironmentIds.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">
                  {t('environments.enabledEnvironments')}:{' '}
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
              {showMergedVariables
                ? t('environments.hideMergedVariables')
                : t('environments.previewMergedVariables')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEnvironment}
            >
              {t('environments.addEnvironment')}
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
              header={t('environments.mergedVariablesHeader')}
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
                        <Tag color="blue">
                          {t('environments.from')}:{' '}
                          {source?.name || t('environments.unknown')}
                        </Tag>
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
          title={
            editingEnvironment
              ? t('common.edit')
              : t('environments.addEnvironment')
          }
          open={isAddModalVisible}
          onOk={handleSaveEnvironment}
          onCancel={() => {
            setIsAddModalVisible(false)
            form.resetFields()
          }}
          okText={t('common.ok')}
          cancelText={t('common.cancel')}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label={t('environments.environmentName')}
              rules={[
                { required: true, message: t('errors.requiredField') },
                {
                  validator: (_, value) => {
                    if (!value || value.trim() === '') {
                      return Promise.reject(
                        new Error(t('errors.requiredField'))
                      )
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder={t('environments.environmentNamePlaceholder')}
              />
            </Form.Item>

            <Form.List name="variables" initialValue={[{ key: '', value: '' }]}>
              {fields => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      key={key}
                      gutter={15}
                      style={{ marginBottom: 8 }}
                      align="middle"
                    >
                      <Col flex="250px">
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder={t('environments.variableName')}
                            size="small"
                            value={
                              form.getFieldValue(['variables', name, 'key']) ||
                              ''
                            }
                            onChange={e =>
                              handleVariableChange(name, 'key', e.target.value)
                            }
                            onFocus={() => handleVariableFocus(name)}
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
                        </Form.Item>
                      </Col>
                      <Col flex="250px">
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder={t('environments.variableValue')}
                            size="small"
                            value={
                              form.getFieldValue([
                                'variables',
                                name,
                                'value',
                              ]) || ''
                            }
                            onChange={e =>
                              handleVariableChange(
                                name,
                                'value',
                                e.target.value
                              )
                            }
                            onFocus={() => handleVariableFocus(name)}
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
                        </Form.Item>
                      </Col>
                      <Col flex="none">
                        {name !== fields.length - 1 && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleRemoveVariable(name)}
                            tabIndex={-1}
                            style={{ color: '#ff4d4f' }}
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </Space>
    </Modal>
  )
}
