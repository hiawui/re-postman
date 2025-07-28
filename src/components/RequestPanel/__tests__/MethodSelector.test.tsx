import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/test-utils'
import { MethodSelector } from '../MethodSelector'
import type { HttpMethod } from '@/types'

describe('MethodSelector', () => {
  const defaultProps = {
    value: 'GET' as HttpMethod,
    onChange: vi.fn(),
  }

  it('renders with default value', () => {
    render(<MethodSelector {...defaultProps} />)

    // 检查默认选中的方法（显示的是翻译后的文本）
    expect(screen.getByText('methods.GET')).toBeInTheDocument()
  })

  it('calls onChange when method is changed', () => {
    render(<MethodSelector {...defaultProps} />)

    // 点击 Select 组件打开下拉菜单
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // 选择 POST 方法
    const postOption = screen.getByText('methods.POST')
    fireEvent.click(postOption)

    // Ant Design Select 的 onChange 可能传递额外的参数，我们只检查第一个参数
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      'POST',
      expect.anything()
    )
  })

  it('displays all HTTP methods', () => {
    render(<MethodSelector {...defaultProps} />)

    // 打开下拉菜单
    const select = screen.getByRole('combobox')
    fireEvent.mouseDown(select)

    // 检查是否包含所有 HTTP 方法（使用 getAllByText 处理重复元素）
    const expectedMethods = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'HEAD',
      'OPTIONS',
    ]
    expectedMethods.forEach(method => {
      const elements = screen.getAllByText(`methods.${method}`)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('updates value when prop changes', () => {
    const { rerender } = render(<MethodSelector {...defaultProps} />)

    expect(screen.getByText('methods.GET')).toBeInTheDocument()

    rerender(<MethodSelector {...defaultProps} value="POST" />)

    expect(screen.getByText('methods.POST')).toBeInTheDocument()
  })
})
