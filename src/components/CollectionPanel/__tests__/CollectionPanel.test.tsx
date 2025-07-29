import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import { CollectionPanel } from '../CollectionPanel'
import { useAppStore } from '@/stores/appStore'

vi.mock('@/stores/appStore', () => ({
  useAppStore: vi.fn(),
}))

const mockUseAppStore = useAppStore as any

describe('CollectionPanel', () => {
  const mockCollections = [
    {
      id: 'collection-1',
      name: 'Test Collection 1',
      description: 'Test description',
      requests: [
        {
          id: 'req-1',
          name: 'Test Request 1',
          method: 'GET' as const,
          url: 'https://api.example.com/test1',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      folders: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'collection-2',
      name: 'Test Collection 2',
      description: 'Test description 2',
      requests: [
        {
          id: 'req-2',
          name: 'Test Request 2',
          method: 'POST' as const,
          url: 'https://api.example.com/test2',
          headers: [],
          body: '',
          bodyType: 'json' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      folders: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  const mockStore = {
    collections: mockCollections,
    addCollection: vi.fn(),
    updateCollection: vi.fn(),
    removeCollection: vi.fn(),
    reorderRequestsInCollection: vi.fn(),
    updateRequestInCollection: vi.fn(),
    removeRequestFromCollection: vi.fn(),
    exportCollections: vi.fn(),
    importCollections: vi.fn(),
  }

  const defaultProps = {
    onSelectRequest: vi.fn(),
    selectedRequestId: 'req-1',
  }

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(mockStore)
    vi.clearAllMocks()
  })

  it('renders collection panel with collections', () => {
    render(<CollectionPanel {...defaultProps} />)

    expect(screen.getByText('Test Collection 1')).toBeInTheDocument()
    expect(screen.getByText('Test Collection 2')).toBeInTheDocument()
    expect(screen.getByText('Test Request 1')).toBeInTheDocument()
    expect(screen.getByText('Test Request 2')).toBeInTheDocument()
  })

  it('renders empty state when no collections', () => {
    mockUseAppStore.mockReturnValue({
      ...mockStore,
      collections: [],
    })

    render(<CollectionPanel {...defaultProps} />)
    expect(screen.getByText('collections.noCollections')).toBeInTheDocument()
  })

  it('shows export and import buttons with tooltips', () => {
    render(<CollectionPanel {...defaultProps} />)

    // Check that buttons exist with their tooltips
    const exportButton = screen.getByTitle(
      'collections.exportCollectionsTooltip'
    )
    const importButton = screen.getByTitle(
      'collections.importCollectionsTooltip'
    )

    expect(exportButton).toBeInTheDocument()
    expect(importButton).toBeInTheDocument()
  })

  it('handles export collections', async () => {
    const mockJsonData = JSON.stringify({ collections: mockCollections })
    mockStore.exportCollections.mockReturnValue(mockJsonData)

    render(<CollectionPanel {...defaultProps} />)

    const exportButton = screen.getByTitle(
      'collections.exportCollectionsTooltip'
    )
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockStore.exportCollections).toHaveBeenCalled()
    })
  })

  it('opens import modal when import button is clicked', () => {
    render(<CollectionPanel {...defaultProps} />)

    const importButton = screen.getByTitle(
      'collections.importCollectionsTooltip'
    )
    fireEvent.click(importButton)

    // Check modal title specifically
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('collections.importMethod')).toBeInTheDocument()
    expect(screen.getByText('collections.uploadFile')).toBeInTheDocument()
  })

  it('handles import collections with valid JSON', async () => {
    const mockImportData = {
      version: '1.0',
      collections: [
        {
          name: 'Imported Collection',
          requests: [
            {
              name: 'Imported Request',
              method: 'GET',
              url: 'https://api.example.com/imported',
              headers: [],
              body: '',
              bodyType: 'json',
            },
          ],
        },
      ],
    }

    mockStore.importCollections.mockReturnValue({
      success: true,
      message: 'Successfully imported 1 collection(s)',
    })

    render(<CollectionPanel {...defaultProps} />)

    // Open import modal
    const importButton = screen.getByTitle(
      'collections.importCollectionsTooltip'
    )
    fireEvent.click(importButton)

    // Fill in JSON data
    const textarea = screen.getByPlaceholderText(
      'collections.importJsonDataPlaceholder'
    )
    fireEvent.change(textarea, {
      target: { value: JSON.stringify(mockImportData) },
    })

    // Submit import
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(mockStore.importCollections).toHaveBeenCalledWith(
        JSON.stringify(mockImportData)
      )
    })
  })

  it('handles import collections with invalid JSON', async () => {
    mockStore.importCollections.mockReturnValue({
      success: false,
      message: 'Invalid data format: collections array is required',
    })

    render(<CollectionPanel {...defaultProps} />)

    // Open import modal
    const importButton = screen.getByTitle(
      'collections.importCollectionsTooltip'
    )
    fireEvent.click(importButton)

    // Fill in invalid JSON data
    const textarea = screen.getByPlaceholderText(
      'collections.importJsonDataPlaceholder'
    )
    fireEvent.change(textarea, {
      target: { value: 'invalid json' },
    })

    // Submit import
    const okButton = screen.getByText('common.ok')
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(mockStore.importCollections).toHaveBeenCalledWith('invalid json')
    })
  })

  it('shows upload file button in import modal', () => {
    render(<CollectionPanel {...defaultProps} />)

    // Open import modal
    const importButton = screen.getByTitle(
      'collections.importCollectionsTooltip'
    )
    fireEvent.click(importButton)

    // Check upload button exists
    expect(screen.getByText('collections.uploadFile')).toBeInTheDocument()
  })

  it('handles collection selection', () => {
    render(<CollectionPanel {...defaultProps} />)

    const requestItem = screen.getByText('Test Request 1')
    fireEvent.click(requestItem)

    expect(defaultProps.onSelectRequest).toHaveBeenCalledWith(
      mockCollections[0].requests[0],
      mockCollections[0].id
    )
  })

  it('handles collection deletion', () => {
    render(<CollectionPanel {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle(
      'collections.deleteCollectionTooltip'
    )
    fireEvent.click(deleteButtons[0])

    // Should show confirmation dialog
    expect(
      screen.getByText('collections.deleteCollectionConfirm')
    ).toBeInTheDocument()
  })

  it('handles request deletion', () => {
    render(<CollectionPanel {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle(
      'collections.deleteRequestTooltip'
    )
    fireEvent.click(deleteButtons[0])

    // Should show confirmation dialog
    expect(
      screen.getByText('collections.deleteRequestConfirm')
    ).toBeInTheDocument()
  })
})
