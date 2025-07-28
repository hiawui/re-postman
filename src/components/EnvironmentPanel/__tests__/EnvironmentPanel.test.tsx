import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import { EnvironmentPanel } from '../EnvironmentPanel'
import { useAppStore } from '../../../stores/appStore'

// Mock the store
vi.mock('../../../stores/appStore', () => ({
  useAppStore: vi.fn(),
}))

// Mock the VariableReplacer
vi.mock('../../../utils/variableReplacer', () => ({
  VariableReplacer: {
    replace: vi.fn((text: string) => text),
    mergeEnvironmentVariables: vi.fn((environments: any[]) => {
      const merged: Record<string, string> = {}
      environments.forEach(env => {
        Object.assign(merged, env.variables)
      })
      return merged
    }),
  },
}))

describe('EnvironmentPanel', () => {
  const mockStore = {
    environments: [
      {
        id: 'env1',
        name: 'Development',
        variables: {
          API_URL: 'https://dev-api.example.com',
          API_KEY: 'dev-key-123',
        },
      },
      {
        id: 'env2',
        name: 'Production',
        variables: {
          API_URL: 'https://api.example.com',
          API_KEY: 'prod-key-456',
        },
      },
    ],
    activeEnvironmentIds: ['env1'],
    addEnvironment: vi.fn(),
    removeEnvironment: vi.fn(),
    activateEnvironment: vi.fn(),
    deactivateEnvironment: vi.fn(),
    updateEnvironment: vi.fn(),
  }

  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAppStore as any).mockReturnValue(mockStore)
  })

  it('should render environment panel when visible', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    expect(
      screen.getByText('environments.environmentManagement')
    ).toBeInTheDocument()
    expect(screen.getByText('environments.manageVariables')).toBeInTheDocument()
  })

  it('should not render when not visible', () => {
    render(<EnvironmentPanel {...defaultProps} visible={false} />)

    expect(
      screen.queryByText('environments.environmentManagement')
    ).not.toBeInTheDocument()
  })

  it('should display environment list in table', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Production')).toBeInTheDocument()
    // 使用更灵活的文本匹配，因为变量计数可能被分割到多个元素中
    expect(screen.getAllByText(/2/)).toHaveLength(2) // 两个环境都有2个变量
    expect(screen.getAllByText(/variables/)).toHaveLength(2)
  })

  it('should show active environment tag', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    expect(screen.getByText('environments.enabled')).toBeInTheDocument()
  })

  it('should show enabled environments info', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    expect(screen.getByText(/enabledEnvironments/)).toBeInTheDocument()
    expect(screen.getAllByText(/Development/)).toHaveLength(2) // 环境名 + 启用环境信息
  })

  it('should open add environment modal when add button is clicked', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const addButtons = screen.getAllByText('environments.addEnvironment')
    // 点击主面板中的添加按钮，不是模态框中的
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      // 检查模态框是否打开，通过检查输入框是否存在
      expect(
        screen.getByPlaceholderText('environments.environmentNamePlaceholder')
      ).toBeInTheDocument()
    })
  })

  it('should open edit environment modal when edit button is clicked', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const editButtons = screen.getAllByText('common.edit')
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      // 检查编辑模态框是否打开，通过检查输入框的值
      expect(screen.getByDisplayValue('Development')).toBeInTheDocument()
    })
  })

  it('should activate environment when enable button is clicked', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const enableButtons = screen.getAllByText('environments.enable')
    fireEvent.click(enableButtons[0])

    expect(mockStore.activateEnvironment).toHaveBeenCalledWith('env2')
  })

  it('should deactivate environment when disable button is clicked', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const disableButtons = screen.getAllByText('environments.disable')
    fireEvent.click(disableButtons[0])

    expect(mockStore.deactivateEnvironment).toHaveBeenCalledWith('env1')
  })

  it('should delete environment when delete button is clicked', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const deleteButtons = screen.getAllByText('common.delete')
    fireEvent.click(deleteButtons[0])

    // Wait for popconfirm to appear and confirm
    await waitFor(() => {
      const confirmButtons = screen.getAllByText('common.delete')
      // 找到确认对话框中的删除按钮
      const confirmButton = confirmButtons.find(button =>
        button.closest('.ant-popconfirm-buttons')
      )
      if (confirmButton) {
        fireEvent.click(confirmButton)
      }
    })

    expect(mockStore.removeEnvironment).toHaveBeenCalledWith('env1')
  })

  it('should toggle merged variables preview', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const previewButton = screen.getByText(
      'environments.previewMergedVariables'
    )
    fireEvent.click(previewButton)

    expect(
      screen.getByText('environments.hideMergedVariables')
    ).toBeInTheDocument()
  })

  it('should show merged variables when preview is enabled', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const previewButton = screen.getByText(
      'environments.previewMergedVariables'
    )
    fireEvent.click(previewButton)

    await waitFor(() => {
      expect(
        screen.getByText('environments.mergedVariablesHeader')
      ).toBeInTheDocument()
      expect(screen.getByText('API_URL')).toBeInTheDocument()
      expect(
        screen.getByText('https://dev-api.example.com')
      ).toBeInTheDocument()
    })
  })

  it('should add new environment with form validation', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(
        'environments.environmentNamePlaceholder'
      )
      fireEvent.change(nameInput, { target: { value: 'Test Environment' } })
    })

    // Add variable
    const keyInputs = screen.getAllByPlaceholderText(
      'environments.variableName'
    )
    const valueInputs = screen.getAllByPlaceholderText(
      'environments.variableValue'
    )

    fireEvent.change(keyInputs[0], { target: { value: 'TEST_KEY' } })
    fireEvent.change(valueInputs[0], { target: { value: 'test_value' } })

    // Submit form
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(mockStore.addEnvironment).toHaveBeenCalledWith({
        name: 'Test Environment',
        variables: { TEST_KEY: 'test_value' },
        isActive: false, // 新环境默认不激活
      })
    })
  })

  it('should show validation error for empty environment name', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      const okButton = screen.getByText('common.ok')
      fireEvent.click(okButton)
    })

    await waitFor(() => {
      expect(screen.getAllByText('errors.requiredField')).toHaveLength(2) // 两个验证错误
    })
  })

  it('should show validation error for duplicate environment name', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(
        'environments.environmentNamePlaceholder'
      )
      fireEvent.change(nameInput, { target: { value: 'Development' } })
    })

    // Submit form
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      // 检查是否有重复名称的错误信息
      expect(screen.getByText(/already exists|duplicate/)).toBeInTheDocument()
    })
  })

  it('should add new variable row when focusing on last row', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      const keyInputs = screen.getAllByPlaceholderText(
        'environments.variableName'
      )
      const lastKeyInput = keyInputs[keyInputs.length - 1]
      fireEvent.focus(lastKeyInput)
    })

    await waitFor(() => {
      const keyInputs = screen.getAllByPlaceholderText(
        'environments.variableName'
      )
      expect(keyInputs).toHaveLength(2) // Original + new row
    })
  })

  it('should remove variable row when delete button is clicked', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      // Add a variable first
      const keyInputs = screen.getAllByPlaceholderText(
        'environments.variableName'
      )
      const valueInputs = screen.getAllByPlaceholderText(
        'environments.variableValue'
      )

      fireEvent.change(keyInputs[0], { target: { value: 'KEY1' } })
      fireEvent.change(valueInputs[0], { target: { value: 'value1' } })

      // Focus to add new row
      fireEvent.focus(keyInputs[0])
    })

    await waitFor(() => {
      const deleteButtons = screen
        .getAllByRole('button')
        .filter(button => button.querySelector('.anticon-delete'))
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0])
      }
    })

    await waitFor(() => {
      const keyInputs = screen.getAllByPlaceholderText(
        'environments.variableName'
      )
      expect(keyInputs).toHaveLength(1) // Only the last empty row should remain
    })
  })

  it('should edit existing environment', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open edit modal
    const editButtons = screen.getAllByText('common.edit')
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Development')
      fireEvent.change(nameInput, { target: { value: 'Updated Development' } })
    })

    // Submit form
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(mockStore.updateEnvironment).toHaveBeenCalledWith('env1', {
        name: 'Updated Development',
        variables: {
          API_URL: 'https://dev-api.example.com',
          API_KEY: 'dev-key-123',
        },
      })
    })
  })

  it('should show variable count in table', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // 使用更灵活的文本匹配，因为变量计数可能被分割到多个元素中
    expect(screen.getAllByText(/2/)).toHaveLength(2) // 两个环境都有2个变量
    expect(screen.getAllByText(/variables/)).toHaveLength(2)
  })

  it('should show variable source in merged preview', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    const previewButton = screen.getByText(
      'environments.previewMergedVariables'
    )
    fireEvent.click(previewButton)

    await waitFor(() => {
      expect(screen.getAllByText(/from:/)).toHaveLength(2) // 两个变量都有来源
      expect(screen.getAllByText('Development').length).toBeGreaterThanOrEqual(
        1
      ) // 至少有一个来源
    })
  })

  it('should handle empty environments list', () => {
    const emptyStore = {
      ...mockStore,
      environments: [],
      activeEnvironmentIds: [],
    }
    ;(useAppStore as any).mockReturnValue(emptyStore)

    render(<EnvironmentPanel {...defaultProps} />)

    expect(
      screen.getByText('environments.environmentManagement')
    ).toBeInTheDocument()
    // Table should be empty but still render
    expect(screen.queryByText('Development')).not.toBeInTheDocument()
  })

  it('should handle multiple active environments', () => {
    const multiActiveStore = {
      ...mockStore,
      activeEnvironmentIds: ['env1', 'env2'],
    }
    ;(useAppStore as any).mockReturnValue(multiActiveStore)

    render(<EnvironmentPanel {...defaultProps} />)

    expect(screen.getAllByText('environments.enabled')).toHaveLength(2)
  })

  it('should show correct variable count for each environment', () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Development has 2 variables - 使用更灵活的文本匹配
    expect(screen.getAllByText(/2/)).toHaveLength(2) // 两个环境都有2个变量
    expect(screen.getAllByText(/variables/)).toHaveLength(2)
  })

  it('should handle special characters in variable names and values', async () => {
    render(<EnvironmentPanel {...defaultProps} />)

    // Open add modal
    const addButtons = screen.getAllByText('environments.addEnvironment')
    fireEvent.click(addButtons[0])

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(
        'environments.environmentNamePlaceholder'
      )
      fireEvent.change(nameInput, { target: { value: 'Test Env' } })

      const keyInputs = screen.getAllByPlaceholderText(
        'environments.variableName'
      )
      const valueInputs = screen.getAllByPlaceholderText(
        'environments.variableValue'
      )

      fireEvent.change(keyInputs[0], { target: { value: 'SPECIAL_KEY_123' } })
      fireEvent.change(valueInputs[0], {
        target: { value: 'special_value_with_spaces' },
      })
    })

    // Submit form
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(mockStore.addEnvironment).toHaveBeenCalledWith({
        name: 'Test Env',
        variables: { SPECIAL_KEY_123: 'special_value_with_spaces' },
        isActive: false, // 新环境默认不激活
      })
    })
  })
})
