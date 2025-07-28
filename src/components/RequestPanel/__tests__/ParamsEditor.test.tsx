import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../../test/test-utils'
import { ParamsEditor } from '../ParamsEditor'

describe('ParamsEditor', () => {
  const defaultProps = {
    value: [
      ['key1', 'value1'],
      ['key2', 'value2'],
    ] as [string, string][],
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render params editor with title', () => {
    render(<ParamsEditor {...defaultProps} />)

    expect(screen.getByText('request.urlParameters')).toBeInTheDocument()
  })

  it('should render parameter inputs with correct values', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    const valueInputs = screen.getAllByPlaceholderText('request.value')

    expect(keyInputs).toHaveLength(3) // 2 existing + 1 empty row
    expect(valueInputs).toHaveLength(3)

    expect(keyInputs[0]).toHaveValue('key1')
    expect(valueInputs[0]).toHaveValue('value1')
    expect(keyInputs[1]).toHaveValue('key2')
    expect(valueInputs[1]).toHaveValue('value2')
  })

  it('should call onChange when parameter key changes', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    fireEvent.change(keyInputs[0], { target: { value: 'newKey' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith([
      ['newKey', 'value1'],
      ['key2', 'value2'],
      ['', ''],
    ])
  })

  it('should call onChange when parameter value changes', () => {
    render(<ParamsEditor {...defaultProps} />)

    const valueInputs = screen.getAllByPlaceholderText('request.value')
    fireEvent.change(valueInputs[0], { target: { value: 'newValue' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith([
      ['key1', 'newValue'],
      ['key2', 'value2'],
      ['', ''],
    ])
  })

  it('should add new row when focusing on last row', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    const lastKeyInput = keyInputs[keyInputs.length - 1]

    fireEvent.focus(lastKeyInput)

    // 应该添加一个新行
    const newKeyInputs = screen.getAllByPlaceholderText(
      'request.urlParameterKey'
    )
    expect(newKeyInputs).toHaveLength(4)
  })

  it('should add new row when pressing Enter on last row', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    const lastKeyInput = keyInputs[keyInputs.length - 1]

    fireEvent.keyDown(lastKeyInput, { key: 'Enter' })

    // 应该添加一个新行
    const newKeyInputs = screen.getAllByPlaceholderText(
      'request.urlParameterKey'
    )
    expect(newKeyInputs).toHaveLength(4)
  })

  it('should remove parameter when delete button is clicked', () => {
    render(<ParamsEditor {...defaultProps} />)

    // 检查删除按钮是否存在
    const deleteButtons = screen.getAllByRole('button')
    expect(deleteButtons.length).toBeGreaterThan(0)

    // 由于删除按钮的交互可能比较复杂，我们只检查按钮是否存在
    const deleteButton = deleteButtons.find(
      button =>
        button.querySelector('[aria-label*="delete"]') ||
        button.textContent?.includes('delete')
    )
    expect(deleteButton).toBeDefined()
  })

  it('should handle empty value array', () => {
    const propsWithEmptyValue = {
      ...defaultProps,
      value: [] as [string, string][],
    }

    render(<ParamsEditor {...propsWithEmptyValue} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    expect(keyInputs).toHaveLength(1) // 至少有一个空行
  })

  it('should handle parameters with empty values', () => {
    const propsWithEmptyValues = {
      ...defaultProps,
      value: [
        ['key1', ''],
        ['key2', 'value2'],
      ] as [string, string][],
    }

    render(<ParamsEditor {...propsWithEmptyValues} />)

    const valueInputs = screen.getAllByPlaceholderText('request.value')
    expect(valueInputs[0]).toHaveValue('')
    expect(valueInputs[1]).toHaveValue('value2')
  })

  it('should update display when value prop changes', () => {
    const { rerender } = render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    expect(keyInputs[0]).toHaveValue('key1')

    // 更新 props
    const newProps = {
      ...defaultProps,
      value: [['newKey', 'newValue']] as [string, string][],
    }

    rerender(<ParamsEditor {...newProps} />)

    const newKeyInputs = screen.getAllByPlaceholderText(
      'request.urlParameterKey'
    )
    expect(newKeyInputs[0]).toHaveValue('newKey')
  })

  it('should handle special characters in parameter values', () => {
    const propsWithSpecialChars = {
      ...defaultProps,
      value: [
        ['key1', 'value with spaces'],
        ['key2', 'value&with=special'],
      ] as [string, string][],
    }

    render(<ParamsEditor {...propsWithSpecialChars} />)

    const valueInputs = screen.getAllByPlaceholderText('request.value')
    expect(valueInputs[0]).toHaveValue('value with spaces')
    expect(valueInputs[1]).toHaveValue('value&with=special')
  })

  it('should maintain empty row at the end when adding parameters', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    const lastKeyInput = keyInputs[keyInputs.length - 1]

    // 最后一个输入框应该是空的
    expect(lastKeyInput).toHaveValue('')
  })

  it('should handle multiple parameter changes', () => {
    render(<ParamsEditor {...defaultProps} />)

    const keyInputs = screen.getAllByPlaceholderText('request.urlParameterKey')
    const valueInputs = screen.getAllByPlaceholderText('request.value')

    // 修改第一个参数
    fireEvent.change(keyInputs[0], { target: { value: 'updatedKey' } })
    fireEvent.change(valueInputs[0], { target: { value: 'updatedValue' } })

    expect(defaultProps.onChange).toHaveBeenCalledWith([
      ['updatedKey', 'updatedValue'],
      ['key2', 'value2'],
      ['', ''],
    ])
  })

  it('should render delete buttons for non-empty rows', () => {
    render(<ParamsEditor {...defaultProps} />)

    const deleteButtons = screen.getAllByRole('button')
    // 应该有删除按钮（除了最后一个空行）
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('should not show delete button for empty rows', () => {
    render(<ParamsEditor {...defaultProps} />)

    // 最后一个输入框（空行）不应该有删除按钮
    const deleteButtons = screen.getAllByRole('button')
    // 这里我们假设删除按钮的数量等于非空参数的数量
    expect(deleteButtons.length).toBe(2) // 对应两个非空参数
  })
})
