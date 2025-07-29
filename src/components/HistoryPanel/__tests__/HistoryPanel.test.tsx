import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import { HistoryPanel } from '../HistoryPanel'
import { useAppStore } from '@/stores/appStore'
import type { HttpRequest } from '@/types'

// Mock the store
vi.mock('@/stores/appStore', () => ({
  useAppStore: vi.fn(),
}))

const mockUseAppStore = useAppStore as any

describe('HistoryPanel', () => {
  const mockHistory: HttpRequest[] = [
    {
      id: 'req-1',
      name: 'Test GET Request',
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: [],
      body: '',
      bodyType: 'json',
      params: [['param1', 'value1']],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'req-2',
      name: 'Test POST Request',
      method: 'POST',
      url: 'https://api.example.com/create',
      headers: [['Content-Type', 'application/json']],
      body: '{"name": "test"}',
      bodyType: 'json',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'req-3',
      name: 'Test PUT Request',
      method: 'PUT',
      url: 'https://api.example.com/update',
      headers: [],
      body: '',
      bodyType: 'json',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  const mockStore = {
    history: mockHistory,
    removeHistoryItem: vi.fn(),
    clearHistory: vi.fn(),
  }

  const mockOnSelectRequest = vi.fn()

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore)
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render history panel with title', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      expect(screen.getByText('history.requestHistory')).toBeInTheDocument()
    })

    it('should render clear history button when history is not empty', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const clearButton = screen.getByRole('button', { name: 'clear' })
      expect(clearButton).toBeInTheDocument()
    })

    it('should not render clear history button when history is empty', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: [],
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const clearButton = screen.queryByRole('button', { name: '' })
      expect(clearButton).not.toBeInTheDocument()
    })

    it('should render empty state when history is empty', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: [],
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      expect(screen.getByText('history.noRequestsYet')).toBeInTheDocument()
    })

    it('should render history items when history is not empty', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      // Check if all history items are rendered
      expect(screen.getByText('GET')).toBeInTheDocument()
      expect(screen.getByText('POST')).toBeInTheDocument()
      expect(screen.getByText('PUT')).toBeInTheDocument()

      // Check if URLs are displayed (with parameters for the first one)
      expect(
        screen.getByText('https://api.example.com/test?param1=value1')
      ).toBeInTheDocument()
      expect(
        screen.getByText('https://api.example.com/create')
      ).toBeInTheDocument()
      expect(
        screen.getByText('https://api.example.com/update')
      ).toBeInTheDocument()
    })
  })

  describe('Method Colors', () => {
    it('should render GET method with green color', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const getTag = screen.getByText('GET').closest('.ant-tag')
      expect(getTag).toHaveClass('ant-tag-green')
    })

    it('should render POST method with blue color', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const postTag = screen.getByText('POST').closest('.ant-tag')
      expect(postTag).toHaveClass('ant-tag-blue')
    })

    it('should render PUT method with orange color', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const putTag = screen.getByText('PUT').closest('.ant-tag')
      expect(putTag).toHaveClass('ant-tag-orange')
    })

    it('should render DELETE method with red color', () => {
      const historyWithDelete = [
        {
          id: 'req-4',
          name: 'Test DELETE Request',
          method: 'DELETE' as const,
          url: 'https://api.example.com/delete',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: historyWithDelete,
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const deleteTag = screen.getByText('DELETE').closest('.ant-tag')
      expect(deleteTag).toHaveClass('ant-tag-red')
    })

    it('should render PATCH method with purple color', () => {
      const historyWithPatch = [
        {
          id: 'req-5',
          name: 'Test PATCH Request',
          method: 'PATCH' as const,
          url: 'https://api.example.com/patch',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: historyWithPatch,
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const patchTag = screen.getByText('PATCH').closest('.ant-tag')
      expect(patchTag).toHaveClass('ant-tag-purple')
    })

    it('should render unknown method with default color', () => {
      const historyWithUnknown = [
        {
          id: 'req-6',
          name: 'Test UNKNOWN Request',
          method: 'UNKNOWN' as any,
          url: 'https://api.example.com/unknown',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: historyWithUnknown,
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const unknownTag = screen.getByText('UNKNOWN').closest('.ant-tag')
      expect(unknownTag).toHaveClass('ant-tag-default')
    })
  })

  describe('Selection State', () => {
    it('should highlight selected request', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId="req-1"
        />
      )

      const selectedItem = screen.getByText('GET').closest('.ant-list-item')
      expect(selectedItem).toHaveStyle({
        backgroundColor: '#e6f7ff',
        border: '1px solid #1890ff',
      })
    })

    it('should not highlight unselected requests', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId="req-1"
        />
      )

      const unselectedItem = screen.getByText('POST').closest('.ant-list-item')
      // Just check that it's not highlighted (doesn't have the selected styles)
      expect(unselectedItem).not.toHaveStyle({
        backgroundColor: '#e6f7ff',
        border: '1px solid #1890ff',
      })
    })
  })

  describe('User Interactions', () => {
    it('should call onSelectRequest when history item is clicked', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const historyItem = screen.getByText('GET').closest('.ant-list-item')
      fireEvent.click(historyItem!)

      expect(mockOnSelectRequest).toHaveBeenCalledWith(mockHistory[0])
    })

    it('should call removeHistoryItem when delete button is clicked', async () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button =>
        button.querySelector('.anticon-delete')
      )

      // The delete button is wrapped in a Popconfirm, so we need to click it and then confirm
      fireEvent.click(deleteButton!)

      // Wait for the popconfirm to appear and click the confirm button
      await waitFor(() => {
        const confirmButton = screen.getByText('common.delete')
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockStore.removeHistoryItem).toHaveBeenCalledWith(0)
      })
    })

    it('should call clearHistory when clear history button is clicked', async () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const clearButtons = screen.getAllByRole('button')
      const clearButton = clearButtons.find(button =>
        button.querySelector('.anticon-clear')
      )

      // The clear button is wrapped in a Popconfirm, so we need to click it and then confirm
      fireEvent.click(clearButton!)

      // Wait for the popconfirm to appear and click the confirm button
      await waitFor(() => {
        const confirmButton = screen.getByText('common.clear')
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockStore.clearHistory).toHaveBeenCalled()
      })
    })

    it('should prevent event propagation when delete button is clicked', async () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button =>
        button.querySelector('.anticon-delete')
      )

      // Test that clicking the delete button doesn't trigger the parent click
      fireEvent.click(deleteButton!)

      // The delete button should not trigger onSelectRequest
      expect(mockOnSelectRequest).not.toHaveBeenCalled()
    })

    it('should prevent event propagation when clear history button is clicked', async () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const clearButtons = screen.getAllByRole('button')
      const clearButton = clearButtons.find(button =>
        button.querySelector('.anticon-clear')
      )

      // Test that clicking the clear button doesn't trigger any unexpected behavior
      fireEvent.click(clearButton!)

      // The clear button should not trigger onSelectRequest
      expect(mockOnSelectRequest).not.toHaveBeenCalled()
    })
  })

  describe('Hover Effects', () => {
    it('should change background color on hover for unselected items', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId="req-1"
        />
      )

      const unselectedItem = screen.getByText('POST').closest('.ant-list-item')

      fireEvent.mouseEnter(unselectedItem!)
      expect(unselectedItem).toHaveStyle({ backgroundColor: '#f5f5f5' })

      fireEvent.mouseLeave(unselectedItem!)
      // Just check that it's not highlighted after mouse leave
      expect(unselectedItem).not.toHaveStyle({
        backgroundColor: '#e6f7ff',
        border: '1px solid #1890ff',
      })
    })

    it('should not change background color on hover for selected items', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId="req-1"
        />
      )

      const selectedItem = screen.getByText('GET').closest('.ant-list-item')

      fireEvent.mouseEnter(selectedItem!)
      expect(selectedItem).toHaveStyle({ backgroundColor: '#e6f7ff' })

      fireEvent.mouseLeave(selectedItem!)
      expect(selectedItem).toHaveStyle({ backgroundColor: '#e6f7ff' })
    })
  })

  describe('URL Display', () => {
    it('should display URL with parameters correctly', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      // The first request has parameters, so it should show the full URL with parameters
      expect(
        screen.getByText('https://api.example.com/test?param1=value1')
      ).toBeInTheDocument()
    })

    it('should display URL without parameters correctly', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      // The second request has no parameters
      expect(
        screen.getByText('https://api.example.com/create')
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty history gracefully', () => {
      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: [],
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      expect(screen.getByText('history.noRequestsYet')).toBeInTheDocument()
      expect(screen.queryByText('GET')).not.toBeInTheDocument()
    })

    it('should handle undefined selectedRequestId', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      // Should render without errors
      expect(screen.getByText('history.requestHistory')).toBeInTheDocument()
    })

    it('should handle non-existent selectedRequestId', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId="non-existent-id"
        />
      )

      // Should render without errors and no items should be highlighted
      expect(screen.getByText('history.requestHistory')).toBeInTheDocument()
    })

    it('should handle requests with missing optional fields', () => {
      const minimalHistory = [
        {
          id: 'req-minimal',
          name: 'Minimal Request',
          method: 'GET' as const,
          url: 'https://api.example.com/minimal',
          headers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      mockUseAppStore.mockReturnValue({
        ...mockStore,
        history: minimalHistory,
      })

      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      expect(
        screen.getByText('https://api.example.com/minimal')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have clickable history items', () => {
      render(
        <HistoryPanel
          onSelectRequest={mockOnSelectRequest}
          selectedRequestId={undefined}
        />
      )

      const historyItems = screen.getAllByText(/https:\/\/api\.example\.com/)
      historyItems.forEach(item => {
        const listItem = item.closest('.ant-list-item')
        const card = listItem?.querySelector('.ant-card')
        expect(card).toHaveStyle({ cursor: 'pointer' })
      })
    })
  })
})
